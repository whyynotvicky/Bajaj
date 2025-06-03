import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const FASTZIX_MERCH_ID = process.env.FASTZIX_MERCH_ID;
const FASTZIX_API_KEY = process.env.FASTZIX_API_KEY || '';
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

if (!FASTZIX_MERCH_ID || !FASTZIX_API_KEY || !NEXT_PUBLIC_APP_URL) {
  console.error('Missing required environment variables for Fastzix integration');
  // Consider throwing an error or returning an appropriate response here
  // throw new Error('Missing required environment variables for Fastzix integration');
}

export async function POST(request: Request) {
  try {
    const { amount, userId, userPhone } = await request.json();

    if (!FASTZIX_MERCH_ID || !FASTZIX_API_KEY || !NEXT_PUBLIC_APP_URL) {
       return NextResponse.json(
        { error: 'Server configuration error: Payment gateway not fully configured.' },
        { status: 500 }
      );
    }

    if (!amount || !userId || !userPhone) {
      console.error('Missing required parameters in request body', { amount, userId, userPhone });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000000);

    // Prepare the request data - ensuring types match documentation
    const data = {
      customer_mobile: parseInt(userPhone), // Cast to integer
      merch_id: FASTZIX_MERCH_ID,
      amount: amount.toString(), // Cast to string
      order_id: orderId,
      currency: 'INR',
      redirect_url: `${NEXT_PUBLIC_APP_URL}wallet/rechargerecord`,
      udf1: userId,
      udf2: 'RechargePayment',
      udf3: 'web',
      udf4: 'recharge',
      udf5: orderId,
    };

    // Generate xverify signature
    const xverify = generateXverify(data, FASTZIX_API_KEY);

    console.log('Sending Fastzix order request with payload:', data);
    console.log('X-VERIFY header:', xverify);

    // Create a transaction record in Firestore
    await db.collection('transactions').doc(orderId).set({
      userId,
      userPhone,
      amount: amount,
      orderId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Make request to Fastzix API
    const response = await fetch('https://fastzix.in/api/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xverify,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    console.log('Received Fastzix order response (status: %s):', response.status, responseData);

    if (!response.ok) {
      console.error('Fastzix API Error:', responseData);
      return NextResponse.json(
        { error: 'Payment gateway error', details: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

function generateXverify(data: Record<string, any>, secretKey: string): string {
  // Sort the data object by keys
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  // Create the data string
  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');

  // Generate HMAC SHA-256 hash
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
} 