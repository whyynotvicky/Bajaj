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
    
    // Robust validation for all required fields
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid or missing amount for Fastzix payment.' }, { status: 400 });
    }
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({ error: 'Missing userId for Fastzix payment.' }, { status: 400 });
    }
    // Allow recharge even if userPhone is missing, but udf2 must not be empty
    let udf2Value = '';
    if (userPhone && typeof userPhone === 'string' && /^\d{10,15}$/.test(userPhone)) {
      udf2Value = userPhone;
    } else {
      udf2Value = userId; // fallback to userId if phone is not available
    }
    const endpoint = "https://fastzix.in/api/v1/order";
    const merch_id = process.env.FASTZIX_MERCH_ID || "MM96ZRCC30UQ1748759109";
    const api_key = process.env.FASTZIX_API_KEY || "3kfXy3ZN9VPj7Yyn4Qb6T0N0cesRnIXo";
    const order_id = "ORD" + Date.now() + Math.floor(Math.random() * 1000000);
    const redirect_url = process.env.NEXT_PUBLIC_APP_URL + "/payment-callback";
    const currency = "INR";

    const payload = {
      customer_mobile: String(userPhone || ''),
      merch_id: String(merch_id),
      amount: String(amount),
      order_id: String(order_id),
      currency: String(currency),
      redirect_url: String(redirect_url),
      udf1: String(userId),
      udf2: udf2Value,
    };
    console.log('Fastzix payload:', JSON.stringify(payload));

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