export async function startFastzixPayment({ amount, userId, userPhone }: { amount: number, userId: string, userPhone: string }) {
  try {
    const response = await fetch('/api/fastzix-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId, userPhone }),
    });
    const data = await response.json();
    if (data.status && data.result && data.result.payment_url) {
      window.location.href = data.result.payment_url;
    } else {
      alert("Fastzix API Error: " + JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    alert("Network or integration error: " + err.message);
  }
} 