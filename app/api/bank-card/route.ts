import { createClient } from '@vercel/edge-config';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';

console.log('API Route initializing...');
const config = createClient(process.env.EDGE_CONFIG);
console.log('Edge Config client created.', process.env.EDGE_CONFIG ? 'Connection string available.' : 'Connection string MISSING!');

export async function POST(request: Request) {
  console.log('Received POST request to /api/bank-card');
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log('Unauthorized attempt to save bank card: User is null.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated in API route:', user.uid);

    const data = await request.json();
    console.log('Request body data:', data);
    const { accountHolderName, accountNumber, ifscCode, bankName } = data;

    // Store bank card details in Edge Config
    console.log('Attempting to save bank card details to Edge Config...');
    await config.set(`bank-card-${user.uid}`, {
      holderName: accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      updatedAt: new Date().toISOString()
    });
    console.log('Successfully saved bank card details to Edge Config.');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/bank-card POST route:', error);
    return NextResponse.json({ error: 'Failed to save bank card' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  console.log('Received GET request to /api/bank-card');
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log('Unauthorized attempt to fetch bank card: User is null.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated for GET request:', user.uid);

    // Get bank card details from Edge Config
    console.log('Attempting to fetch bank card details from Edge Config...');
    const bankCard = await config.get(`bank-card-${user.uid}`);
    console.log('Successfully fetched bank card details:', bankCard);

    return NextResponse.json({ bankCard });
  } catch (error) {
    console.error('Error in /api/bank-card GET route:', error);
    return NextResponse.json({ error: 'Failed to fetch bank card' }, { status: 500 });
  }
} 