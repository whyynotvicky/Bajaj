"use client"

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(searchParams.get("status"));
    setOrderId(searchParams.get("order_id"));
    // Optionally, you can update Firestore here based on status/orderId
    // setTimeout(() => router.push("/profile"), 5000); // Auto-redirect after 5s
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Payment Result</h1>
      {status === "success" ? (
        <p className="text-green-600 font-semibold">Payment Successful! Order ID: {orderId}</p>
      ) : status === "failed" ? (
        <p className="text-red-600 font-semibold">Payment Failed. Please try again.</p>
      ) : (
        <p>Processing payment result...</p>
      )}
    </div>
  );
} 