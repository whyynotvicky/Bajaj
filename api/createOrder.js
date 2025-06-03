import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { amount, userPhone, userId } = req.body;
  if (!amount || !userPhone || !userId) return res.status(400).send("Missing data");

  const fastzixUrl = "https://fastzix.in/api/v1/order";
  const data = {
    customer_mobile: userPhone,
    merch_id: "MM96ZRCC30UQ1748759109",
    amount,
    order_id: "ORD" + Date.now() + Math.floor(Math.random() * 1000000),
    currency: "INR",
    redirect_url: "https://bajaj-fd278.web.app/wallet/rechargerecord",
    udf1: userId,
  };

  // Generate xverify
  const secret_key = "3kfXy3ZN9VPj7Yyn4Qb6T0N0cesRnIXo";
  const sortedKeys = Object.keys(data).sort();
  const dataString = sortedKeys.map(key => key + "=" + data[key]).join("|");
  const xverify = crypto.createHmac("sha256", secret_key).update(dataString).digest("hex");

  const response = await fetch(fastzixUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": xverify,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result.status && result.result && result.result.payment_url) {
    // Optionally, store order in a database (Vercel KV, Firestore, etc.)
    res.json({ payment_url: result.result.payment_url });
  } else {
    res.status(500).send("Failed to create Fastzix order");
  }
} 