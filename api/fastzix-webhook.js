export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Fastzix sends JSON
  const { status, order_id, amount, udf1 } = req.body;
  console.log('Fastzix Webhook:', req.body);

  // TODO: Add Firestore update logic here if you want

  // Always respond quickly
  res.status(200).json({ ok: true });
} 