"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const query = sessionId
      ? `payment=success&session_id=${encodeURIComponent(sessionId)}`
      : "payment=success";
    router.replace(`/orders?${query}`);
  }, [router, searchParams]);

  return <p className="py-10 text-center text-sm text-slate-600">Payment complete. Redirecting to orders...</p>;
}

