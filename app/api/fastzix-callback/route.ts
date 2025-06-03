import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { status, order_id, signature } = data;

    // Verify signature if provided
    if (signature) {
      const calculatedSignature = generateSignature(data, process.env.FASTZIX_API_KEY || '');
      if (signature !== calculatedSignature) {
        console.error('Invalid signature in callback');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Get the transaction from Firestore
    const transactionRef = db.collection('transactions').doc(order_id);
    const transaction = await transactionRef.get();

    if (!transaction.exists) {
      console.error('Transaction not found:', order_id);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transactionData = transaction.data();

    // If already processed, return success
    if (transactionData?.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Transaction already processed' });
    }

    // Start a Firestore transaction
    await db.runTransaction(async (transaction) => {
      // Update transaction status
      transaction.update(transactionRef, {
        status,
        updatedAt: new Date().toISOString(),
      });

      // If payment is successful, update user's balance
      if (status === 'SUCCESS' && transactionData) {
        const userRef = db.collection('users').doc(transactionData.userId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const newBalance = (userData?.balance || 0) + transactionData.amount;
          
          transaction.update(userRef, {
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          });

          // Add transaction to user's history
          const historyRef = userRef.collection('transactions').doc(order_id);
          transaction.set(historyRef, {
            type: 'recharge',
            amount: transactionData.amount,
            status: 'SUCCESS',
            orderId: order_id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    return NextResponse.json({ message: 'Callback processed successfully' });
  } catch (error: any) {
    console.error('Error processing callback:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

function generateSignature(data: Record<string, any>, secretKey: string): string {
  const crypto = require('crypto');
  const sortedData = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  const dataString = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');

  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
} 