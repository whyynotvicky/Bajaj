import { createClient } from '@vercel/edge-config';
import { NextResponse } from 'next/server';

// Import Firebase Admin SDK
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore'; // Import Firestore

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Decode the Base64 service account key JSON string
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON_BASE64 ?
    Buffer.from(process.env.FIREBASE_ADMIN_SDK_JSON_BASE64, 'base64').toString('utf8') : '{}';

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: 'YOUR_DATABASE_URL', // if you are using Realtime Database
      // storageBucket: 'YOUR_STORAGE_BUCKET', // if you are using Cloud Storage
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Depending on how critical Firebase Admin is, you might want to
    // throw the error or handle it more gracefully.
    // For now, we log it.
  }
}

// Always get the first app and initialize Firestore
const db = getFirestore(admin.apps[0]);

console.log('API Route initializing...');
// Remove Edge Config client initialization
// const config = createClient(process.env.EDGE_CONFIG);
// console.log('Edge Config client created.', process.env.EDGE_CONFIG ? 'Connection string available.' : 'Connection string MISSING!');

export async function POST(request: Request) {
  console.log('Received POST request to /api/bank-card');
  // Add check for Firestore initialization
  if (!db) {
    console.error('Firestore not initialized. Cannot process request.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized attempt to save bank details: No token provided.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = decodedToken;

    console.log('User authenticated in API route:', user.uid);

    const data = await request.json();
    console.log('Request body data:', data);
    const { accountHolderName, accountNumber, ifscCode, bankName } = data;

    // Save bank card details to Firestore
    console.log('Attempting to save bank details to Firestore...');
    await db.collection('bankDetails').doc(user.uid).set({
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      updatedAt: new Date().toISOString()
    });
    console.log('Successfully saved bank details to Firestore.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/bank-card POST route:', error);
    // General catch for other errors
    return NextResponse.json({ error: 'Failed to save bank card' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  console.log('Received GET request to /api/bank-card');
  // Add check for Firestore initialization
  if (!db) {
    console.error('Firestore not initialized. Cannot process request.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized attempt to fetch bank card: No token provided.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token for GET:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const user = decodedToken;

    console.log('User authenticated for GET request:', user.uid);

    // Get bank card details from Firestore
    console.log('Attempting to fetch bank card details from Firestore...');
    const docRef = db.collection('bankDetails').doc(user.uid);
    const docSnap = await docRef.get();

    let bankCard = null;
    if (docSnap.exists) {
      bankCard = docSnap.data();
      console.log('Successfully fetched bank card details:', bankCard);
    } else {
      console.log('No bank card details found for user.');
    }

    return NextResponse.json({ bankCard });
  } catch (error) {
    console.error('Error in /api/bank-card GET route:', error);
    return NextResponse.json({ error: 'Failed to fetch bank card' }, { status: 500 });
  }
}

