export async function startFastzixPayment({ amount, userId, userPhone, onError }: { amount: number, userId: string, userPhone: string, onError?: (msg: string) => void }) {
  try {
    const response = await fetch('/api/fastzix-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId, userPhone }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment order');
    }

    const data = await response.json();
    if (data.status && data.result && data.result.payment_url) {
      window.location.href = data.result.payment_url;
    } else {
      if (onError) onError("Fastzix API Error: " + (data.message || JSON.stringify(data, null, 2)));
      else alert("Fastzix API Error: " + JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    if (onError) onError("Network or integration error: " + err.message);
    else alert("Network or integration error: " + err.message);
  }
} 