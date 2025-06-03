export async function startFastzixPayment({ amount, userId, userPhone }: { amount: number, userId: string, userPhone: string }) {
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
    api_key,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (data.status && data.result && data.result.payment_url) {
    window.location.href = data.result.payment_url;
  } else {
    alert("Failed to create payment order. Please try again.");
  }
} 