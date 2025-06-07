export async function startFastzixPayment({ amount, userId, userPhone, onError }: { amount: number, userId: string, userPhone: string, onError?: (msg: string) => void }) {
  try {
    console.log('Starting Fastzix payment:', { amount, userId, userPhone });
    
    const response = await fetch('/api/fastzix-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId, userPhone }),
    });
    
    const data = await response.json();
    console.log('Fastzix order response:', data);
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Failed to create payment order';
      console.error('Fastzix order error:', errorMessage, data);
      if (onError) onError(errorMessage);
      else alert(errorMessage);
      return;
    }

    if (data.success && data.payment_url) {
      console.log('Redirecting to payment URL:', data.payment_url);
      window.location.href = data.payment_url;
    } else {
      const errorMessage = data.message || data.error || "Failed to get payment URL";
      console.error('Fastzix API Error:', errorMessage, data);
      if (onError) onError(errorMessage);
      else alert(errorMessage);
    }
  } catch (err: any) {
    const errorMessage = err.message || "Network or integration error";
    console.error('Fastzix payment error:', errorMessage, err);
    if (onError) onError(errorMessage);
    else alert(errorMessage);
  }
} 