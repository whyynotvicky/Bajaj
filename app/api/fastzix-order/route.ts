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
    throw new Error('Missing FIREBASE_ADMIN_SDK_JSON_BASE64 environment variable');
  } else {
    try {
      // Decode the base64 string and parse it as JSON
      const decodedJsonString = Buffer.from(firebaseAdminSdkJsonBase64, 'base64').toString('utf-8');
      // Check if the decoded string is valid JSON
      if (!decodedJsonString.trim().startsWith('{')) {
        throw new Error('Decoded string is not valid JSON');
      }
      const serviceAccount = JSON.parse(decodedJsonString);
      
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully using base64 encoded key.');
    } catch (error: any) {
      console.error('Failed to initialize Firebase Admin SDK from base64 key:', error);
      throw new Error('Failed to initialize Firebase Admin SDK from base64 key: ' + error.message);
    }
  }
}

const db = getApps().length ? getFirestore() : null; // Only get Firestore if app was initialized

export async function POST(request: Request) {
  // Basic check for essential environment variables for Fastzix
  console.log('Received request to /api/fastzix-order');
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
    console.error('Database not initialized in /api/fastzix-order route');
    return NextResponse.json(
      { error: 'Server configuration error: Database not available.' },
      { status: 500 }
    );
  }

  try {
    const { amount, userId, userPhone } = await request.json();
    console.log('Received payment request data:', { amount, userId, userPhone });

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
    const shortOrderId = orderId.substring(0, 20); // Create a shorter version for UDF fields
    const redirectUrl = `${NEXT_PUBLIC_APP_URL}wallet/rechargerecord`; // Use configured redirect URL
    console.log('Generated orderId and redirect URL:', { orderId, shortOrderId, redirectUrl });

    // Create a transaction document in Firestore immediately with pending status
    const transactionRef = db.collection('transactions').doc(orderId);
    const transactionData = {
      orderId,
      shortOrderId, // Store the short version for reference
      userId,
      amount,
      userPhone: customerMobileInt,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    console.log('Attempting to create transaction document in Firestore:', transactionData);
    await transactionRef.set(transactionData);
    console.log('Transaction document created successfully in Firestore.');

    // Prepare data for Fastzix API call
    const fastzixApiUrl = 'https://fastzix.in/api/v1/order';
    const fastzixData = {
      customer_mobile: customerMobileInt,
      merch_id: FASTZIX_MERCH_ID,
      amount: amount,
      order_id: orderId,
      currency: 'INR',
      redirect_url: redirectUrl,
      udf1: userId.substring(0, 20), // Truncate userId to 20 characters
      udf2: 'Recharge',
      udf3: userPhone,
      udf4: 'NextJS',
      udf5: shortOrderId // Use the shorter order ID
    };

    // Generate xverify signature
    const secret_key = FASTZIX_API_KEY;
    function generateXverify(data: Record<string, any>, secret_key: string): string {
      const sortedKeys = Object.keys(data).sort();
      const dataString = sortedKeys.map(key => `${key}=${data[key]}`).join('|');
      return crypto.createHmac('sha256', secret_key).update(dataString).digest('hex');
    }
    const xverify = generateXverify(fastzixData, secret_key);

    console.log('Prepared Fastzix API data:', fastzixData);
    console.log('Generated X-VERIFY signature:', xverify);

    // Call Fastzix API
    console.log(`Calling Fastzix API at ${fastzixApiUrl}`);
    const response = await fetch(fastzixApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xverify,
      },
      body: JSON.stringify(fastzixData),
    });
    console.log(`Fastzix API raw response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('Fastzix API raw response body:', responseData);

    if (!response.ok) {
      console.error('Fastzix API returned non-OK status:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      // Update transaction status to FAILED if API call fails
      console.log('Updating transaction status to FAILED due to non-OK Fastzix response');
      await transactionRef.update({ 
        status: 'FAILED',
        errorDetails: responseData,
        errorTimestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Payment gateway error', 
          message: responseData.message || 'Failed to process payment',
          details: responseData
        },
        { status: response.status }
      );
    }

    // Check Fastzix specific success status and payment_url
    if (responseData.status === true && responseData.result && responseData.result.payment_url) {
      console.log('Payment URL received from Fastzix:', responseData.result.payment_url);
      // Update transaction status to REDIRECTING or similar
      console.log('Updating transaction status to REDIRECTING');
      await transactionRef.update({ 
        status: 'REDIRECTING',
        paymentUrl: responseData.result.payment_url,
        updatedAt: new Date().toISOString()
      });
      return NextResponse.json({
        success: true,
        payment_url: responseData.result.payment_url
      });
    } else {
      console.error('Invalid Fastzix response structure or success status:', responseData);
      // Update transaction status to FAILED if Fastzix response is invalid
      console.log('Updating transaction status to FAILED due to invalid Fastzix response');
      await transactionRef.update({ 
        status: 'FAILED',
        errorDetails: responseData,
        errorTimestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Failed to generate payment URL', 
          message: responseData.message || 'Invalid response from payment gateway',
          details: responseData 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Server configuration error: Database not available.' },
      { status: 500 }
    );
  }
}

// Helper function to generate X-VERIFY signature (adjust based on actual Fastzix requirements)
// Assuming similar to payout docs signature calculation.
function generateSignature(data: Record<string, any>, secretKey: string): string {
  // Clone data and remove signature field if present
  const dataToSign: Record<string, any> = { ...data };
  // Assuming signature is not part of the data used to generate signature for Fastzix payin callback
  // delete dataToSign.signature; 

  // Sort the data object by keys
  const sortedData = Object.keys(dataToSign)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
       // Ensure values are treated as strings for the signature calculation if required by Fastzix
       acc[key] = String(dataToSign[key]);
       return acc;
    }, {});

  // Create the data string: parameter1=value1|parameter2=value2|...
  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');

    console.log('Signature data string:', dataString);

  // Generate HMAC SHA-256 hash
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
} 