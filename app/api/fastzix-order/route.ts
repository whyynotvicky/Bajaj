import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateHmacSignature(payload: Record<string, string>, apiKey: string): string {
  const sortedKeys = Object.keys(payload).sort();
  const dataString = sortedKeys.map(key => `${key}=${payload[key]}`).join('|');
  return crypto.createHmac('sha256', apiKey).update(dataString).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { amount, userId, userPhone } = await req.json();
    
    if (!userPhone) {
      return NextResponse.json({ error: 'Missing userPhone for Fastzix payment.' }, { status: 400 });
    }

    const endpoint = "https://fastzix.in/api/v1/order";
    const merch_id = process.env.FASTZIX_MERCH_ID || "MM96ZRCC30UQ1748759109";
    const api_key = process.env.FASTZIX_API_KEY || "3kfXy3ZN9VPj7Yyn4Qb6T0N0cesRnIXo";
    const order_id = "ORD" + Date.now() + Math.floor(Math.random() * 1000000);
    const redirect_url = process.env.NEXT_PUBLIC_APP_URL + "/payment-callback";
    const currency = "INR";

    const payload = {
      customer_mobile: String(userPhone),
      merch_id: String(merch_id),
      amount: String(amount),
      order_id: String(order_id),
      currency: String(currency),
      redirect_url: String(redirect_url),
      udf1: String(userId),
      udf2: String(userPhone),
    };
    console.log('Fastzix payload:', payload);

    const xVerify = generateHmacSignature(payload, api_key);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 