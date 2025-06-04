import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import crypto from 'crypto'; // Import crypto module

// Ensure environment variables are loaded
const FASTZIX_MERCH_ID = process.env.FASTZIX_MERCH_ID;
const FASTZIX_API_KEY = process.env.FASTZIX_API_KEY;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const firebaseAdminSdkJsonBase64 = process.env.FIREBASE_ADMIN_SDK_JSON_BASE64;
  
  // Check if the base64 encoded JSON variable is set
  if (!firebaseAdminSdkJsonBase64) {
    console.error('Missing FIREBASE_ADMIN_SDK_JSON_BASE64 environment variable');
    // Depending on your app structure, you might want to handle this more gracefully
  } else {
    try {
      // Decode the base64 string and parse it as JSON
      const decodedJsonString = Buffer.from(firebaseAdminSdkJsonBase64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(decodedJsonString);
      
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully using base64 encoded key.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK from base64 key:', error);
       // Handle parsing or initialization errors
    }
  }
}

const db = getApps().length ? getFirestore() : null; // Only get Firestore if app was initialized

export async function POST(request: Request) {
  // Basic check for essential environment variables for Fastzix
  if (!FASTZIX_MERCH_ID || !FASTZIX_API_KEY || !NEXT_PUBLIC_APP_URL) {
    console.error('Missing essential Fastzix environment variables:', {
      hasMerchId: !!FASTZIX_MERCH_ID,
      hasApiKey: !!FASTZIX_API_KEY,
      hasAppUrl: !!NEXT_PUBLIC_APP_URL,
      appUrl: NEXT_PUBLIC_APP_URL
    });
    return NextResponse.json(
      { error: 'Server configuration error: Payment gateway not fully configured.' },
      { status: 500 }
    );
  }

  // Ensure database is initialized
  if (!db) {
     console.error('Database not initialized');
     return NextResponse.json(
       { error: 'Server configuration error: Database not available.' },
       { status: 500 }
     );
  }

  try {
    const { amount, userId, userPhone } = await request.json();
    console.log('Received payment request:', { amount, userId, userPhone });

    // Validate incoming request parameters
    if (!amount || typeof amount !== 'number' || amount <= 0) {
       console.error('Invalid or missing amount', { amount });
       return NextResponse.json(
         { error: 'Invalid or missing amount' },
         { status: 400 }
       );
    }
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
       console.error('Invalid or missing userId', { userId });
       return NextResponse.json(
         { error: 'Invalid or missing userId' },
         { status: 400 }
       );
    }
     // Assuming userPhone comes as a string and needs validation/parsing
    if (!userPhone || typeof userPhone !== 'string' || !/^\d{10,15}$/.test(userPhone)) {
        console.error('Invalid or missing userPhone', { userPhone });
        return NextResponse.json(
            { error: 'Invalid or missing userPhone (10-15 digits required)' },
            { status: 400 }
        );
    }
    const customerMobileInt = parseInt(userPhone); // Cast to integer for API
    if (isNaN(customerMobileInt)) {
         console.error('Failed to parse userPhone as integer', { userPhone });
         return NextResponse.json(
             { error: 'Invalid userPhone format' },
             { status: 400 }
         );
    }

    // Generate unique order ID
    const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000000);
    const redirectUrl = `${NEXT_PUBLIC_APP_URL}wallet/rechargerecord`; // Use configured redirect URL
    console.log('Generated redirect URL:', redirectUrl);

    // Prepare the request data for Fastzix - Strictly following documentation types
    const data: Record<string, any> = {
      customer_mobile: customerMobileInt, // int
      merch_id: FASTZIX_MERCH_ID, // string
      amount: amount.toFixed(2), // string (2 decimal places for currency)
      order_id: orderId, // string
      currency: 'INR', // string (assuming INR based on previous code)
      redirect_url: redirectUrl, // string
      udf1: userId, // string (using userId for tracking)
      udf2: 'Recharge', // string (simple descriptive string)
      udf3: userPhone, // string (storing original phone string)
      udf4: 'NextJS', // string (indicating source framework)
      udf5: orderId, // string (duplicate orderId for redundancy/tracking)
    };

    // Generate xverify signature
    const xverify = generateXverify(data, FASTZIX_API_KEY);

    console.log('Sending Fastzix order request with payload:', JSON.stringify(data));
    console.log('X-VERIFY header:', xverify);

    try {
      // Create a transaction record in Firestore BEFORE calling Fastzix
      const transactionRef = db.collection('transactions').doc(orderId);
      await transactionRef.set({
        userId,
        userPhone,
        amount: amount, // Store original number amount
        orderId,
        status: 'PENDING', // Initial status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fastzixRequestPayload: data, // Store payload sent to Fastzix for debugging
        fastzixResponse: null, // Placeholder for Fastzix response
      });
      console.log('Firestore transaction record created for orderId:', orderId);

      // Make request to Fastzix API
      const fastzixApiUrl = 'https://fastzix.in/api/v1/order';
      console.log('Making request to Fastzix API:', fastzixApiUrl);
      
      const response = await fetch(fastzixApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xverify,
        },
        body: JSON.stringify(data),
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });

      const responseData = await response.json();
      console.log('Fastzix API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      // Update the transaction record with Fastzix response
      await transactionRef.update({
        fastzixResponse: responseData,
        updatedAt: new Date().toISOString(),
      });
      console.log('Updated transaction record with Fastzix response');

      if (!response.ok) {
        console.error('Fastzix API returned non-OK status:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        await transactionRef.update({ status: 'FAILED' });
        return NextResponse.json(
          { error: 'Payment gateway error', details: responseData },
          { status: response.status }
        );
      }

      // Check Fastzix specific success status and payment_url
      if (responseData.status === true && responseData.result && responseData.result.payment_url) {
        console.log('Payment URL received:', responseData.result.payment_url);
        await transactionRef.update({ status: 'REDIRECTING' });
        return NextResponse.json({
          success: true,
          payment_url: responseData.result.payment_url
        });
      } else {
        console.error('Invalid Fastzix response:', responseData);
        await transactionRef.update({ status: 'FAILED' });
        return NextResponse.json(
          { error: 'Failed to generate payment URL from Fastzix', details: responseData },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('Error in Fastzix API call or Firestore operation:', error);
      return NextResponse.json(
        { error: 'Payment processing error', message: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing payment request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate X-VERIFY signature
function generateXverify(data: Record<string, any>, secretKey: string): string {
  // Sort the data object by keys
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      // Ensure values are treated as strings for the signature calculation
      acc[key] = String(data[key]);
      return acc;
    }, {});

  // Create the data string: parameter1=value1|parameter2=value2|...
  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');

  // Generate HMAC SHA-256 hash
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
} 