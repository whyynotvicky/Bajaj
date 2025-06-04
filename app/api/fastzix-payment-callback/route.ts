import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import crypto from 'crypto'; // Import crypto module

// Ensure environment variables are loaded
const FASTZIX_API_KEY = process.env.FASTZIX_API_KEY;

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  // Check if Firebase environment variables are set
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing Firebase environment variables in callback handler');
    // Depending on your app structure, you might want to handle this more gracefully
  } else {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters
      }),
    });
  }
}

const db = getApps().length ? getFirestore() : null; // Only get Firestore if app was initialized

export async function POST(request: Request) {
    // Add a specific route identifier to avoid conflicts
    const routeIdentifier = 'fastzix-payment-callback';
    
    // Basic check for essential environment variable for signature verification
    if (!FASTZIX_API_KEY) {
        console.error('Missing essential Fastzix API key for signature verification in callback');
        return NextResponse.json(
          { error: 'Server configuration error: API key not available for verification.' },
          { status: 500 }
        );
    }

     // Ensure database is initialized
    if (!db) {
        console.error('Database not initialized in callback handler');
        return NextResponse.json(
          { error: 'Server configuration error: Database not available.' },
          { status: 500 }
        );
    }

  try {
    const data = await request.json();
    console.log('Fastzix callback received data:', JSON.stringify(data));

    const { status, order_id, signature, amount: callbackAmount, customer_mobile: callbackPhone } = data; // Destructure relevant fields

    // Validate incoming webhook data
    if (!status || !order_id) {
      console.error('Missing essential parameters in callback data', { status, order_id });
      return NextResponse.json({ error: 'Missing essential parameters' }, { status: 400 });
    }
     // Optionally validate amount and phone if needed, but rely on fetching from DB for canonical values

    // Verify webhook signature if signature is provided by Fastzix
    if (signature) {
      const calculatedSignature = generateSignature(data, FASTZIX_API_KEY);
      if (signature !== calculatedSignature) {
        console.error('Invalid signature in callback for order:', order_id);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
       console.log('Webhook signature verified for order:', order_id);
    } else {
         console.warn('Webhook signature not provided for order:', order_id);
         // Depending on Fastzix documentation, you might require a signature.
         // For now, we log a warning but proceed. Adjust if signature is mandatory.
    }

    // Get the transaction from Firestore using the order_id
    const transactionRef = db.collection('transactions').doc(order_id);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      console.error('Transaction not found for order_id:', order_id);
      // Respond with 404 or a success to avoid Fastzix retries for non-existent orders
      return NextResponse.json({ message: 'Transaction not found (might be an old or invalid order)' }, { status: 404 });
    }

    const transactionData = transactionDoc.data();

    // If already processed (status is not PENDING), return success to Fastzix to stop retries
    if (transactionData?.status !== 'PENDING') {
      console.log('Transaction already processed for order_id:', order_id, 'current status:', transactionData?.status);
      return NextResponse.json({ message: 'Transaction already processed' });
    }

    // Start a Firestore transaction for atomic updates
    await db.runTransaction(async (firestoreTransaction) => {
        // Re-fetch the document within the transaction to ensure up-to-date data
        const latestTransactionDoc = await firestoreTransaction.get(transactionRef);
        const latestTransactionData = latestTransactionDoc.data();

        // Double check status within the transaction (optimistic concurrency control)
        if (latestTransactionData?.status !== 'PENDING') {
            console.warn('Transaction status changed during transaction for order_id:', order_id);
            return; // Abort transaction if status is not PENDING
        }

        // Update transaction status based on Fastzix status
        const newStatus = (status === 'SUCCESS') ? 'SUCCESS' : 'FAILED';
        firestoreTransaction.update(transactionRef, {
          status: newStatus,
          fastzixCallbackData: data, // Store the full callback data
          updatedAt: new Date().toISOString(),
        });
         console.log('Firestore transaction record updated with callback data and new status:', newStatus, 'for orderId:', order_id);

        // If payment is successful, update user's balance
        if (newStatus === 'SUCCESS' && latestTransactionData) {
            const userId = latestTransactionData.userId; // Get userId from the transaction record
            const amountToAdd = latestTransactionData.amount; // Get original amount from the transaction record
            const userRef = db.collection('users').doc(userId);

            // Fetch user document within the transaction
            const userDoc = await firestoreTransaction.get(userRef);

            if (userDoc.exists) {
                const userData = userDoc.data();
                const currentBalance = userData?.balance || 0;
                const currentTotalMoney = userData?.total_money || 0;

                firestoreTransaction.update(userRef, {
                    balance: currentBalance + amountToAdd,
                    total_money: currentTotalMoney + amountToAdd,
                    updatedAt: new Date().toISOString(),
                });
                 console.log('User balance updated for userId:', userId, 'amount:', amountToAdd);

                // Optional: Add a history entry to user's subcollection
                const historyRef = userRef.collection('transactions').doc(order_id);
                 firestoreTransaction.set(historyRef, {
                     type: 'recharge',
                     amount: amountToAdd,
                     status: 'SUCCESS',
                     orderId: order_id,
                     createdAt: new Date().toISOString(), // Use creation time from order initiation or callback time
                 });
                console.log('User transaction history added for userId:', userId, 'orderId:', order_id);

            } else {
                 console.error('User document not found for userId:', userId, 'during callback processing');
                 // Handle case where user doesn't exist (shouldn't happen if transaction was created correctly)
            }
        }
    });

    // Respond with a success status code to the webhook sender (Fastzix)
    return NextResponse.json({ message: 'Callback processed successfully' });

  } catch (error: any) {
    console.error('Error processing Fastzix callback:', error);
    // Respond with a non-200 status code to indicate failure to Fastzix (might trigger retries)
    return NextResponse.json(
      { error: 'Internal server error processing callback', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate X-VERIFY signature (adjust based on actual Fastzix requirements)
// The payout documentation showed signature based on sorted data excluding 'signature'.
// Assuming similar for payin callback, but confirm with PayIn callback docs if available.
function generateSignature(data: Record<string, any>, secretKey: string): string {
  // Clone data and remove signature field if present
  const dataToSign: Record<string, any> = { ...data };
  delete dataToSign.signature;

  // Sort the data object by keys
  const sortedData = Object.keys(dataToSign)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
       // Ensure values are treated as strings for the signature calculation if required by Fastzix
       // The payout docs example showed string values for signature generation.
       acc[key] = String(dataToSign[key]);
       return acc;
    }, {});

  // Create the data string: parameter1=value1|parameter2=value2|...
  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');

    console.log('Callback signature data string:', dataString);

  // Generate HMAC SHA-256 hash
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
} 