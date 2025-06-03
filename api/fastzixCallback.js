export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { status, order_id } = req.body;
  // TODO: Update your database with payment status here
  if (status === "SUCCESS") {
    // Mark order as paid, update user balance, etc.
    res.send("Order updated and user balance incremented");
  } else {
    res.send("Order status updated");
  }
} 