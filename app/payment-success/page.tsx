"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { paymentsService } from "@/services";
import { clearCart } from "@/lib/cart";
import { routes } from "@/lib/routes";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace(`${routes.customerOrders}?payment=success`);
      return;
    }

    if (!user) {
      toast.error("Please login to complete your order sync");
      router.replace(routes.login);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const result = await paymentsService.confirmStripeSession(token, sessionId);
        clearCart();
        const orderId = result?.order?.id;
        const query = orderId
          ? `payment=success&session_id=${encodeURIComponent(sessionId)}&orderId=${encodeURIComponent(orderId)}`
          : `payment=success&session_id=${encodeURIComponent(sessionId)}`;
        if (isMounted) {
          router.replace(`${routes.customerOrders}?${query}`);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error instanceof Error ? error.message : "Failed to verify payment");
          router.replace(`${routes.customerOrders}?payment=success`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loading, router, searchParams, token, user]);

  return <p className="py-10 text-center text-sm text-slate-600">Verifying payment and creating order...</p>;
}
