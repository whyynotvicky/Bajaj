import crypto from 'crypto';

function generateHmacSignature(payload, apiKey) {
  const sortedKeys = Object.keys(payload).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${payload[key]}`)
    .join('&');
  return crypto
    .createHmac('sha256', apiKey)
    .update(signatureString)
    .digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, userId, userPhone } = req.body;
  const endpoint = "https://fastzix.in/api/v1/order";
  const merch_id = "MM96ZRCC30UQ1748759109";
  const api_key = "3kfXy3ZN9VPj7Yyn4Qb6T0N0cesRnIXo";
  const order_id = "ORD" + Date.now() + Math.floor(Math.random() * 1000000);
  const redirect_url = "https://bajaj-fd278.web.app/payment-callback";
  const currency = "INR";

  const payload = {
    customer_mobile: userPhone,
    merch_id,
    amount,
    order_id,
    currency,
    redirect_url,
    udf1: userId,
    udf2: "",
  };

  // Debug: log the payload
  console.log('Fastzix payload:', payload);

  // Generate HMAC signature using payload + api_key
  const xVerify = generateHmacSignature({ ...payload, api_key }, api_key);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Verify": xVerify
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    // Debug: log the response
    console.log('Fastzix response:', data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 