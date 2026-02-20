import { apiRequest } from "@/lib/api";

type StripeCheckoutPayload = {
  deliveryAddress: string;
  note?: string;
  scheduleType?: "NOW" | "LATER";
  scheduledAt?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type StripeCheckoutResponse = {
  sessionId?: string;
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
};

type ConfirmStripeSessionResponse = {
  created?: boolean;
  order?: { id?: string };
};

export const paymentsService = {
  createStripeCheckoutSession(token: string, payload: StripeCheckoutPayload) {
    return apiRequest<StripeCheckoutResponse>("/api/v1/payments/stripe/checkout-session", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  confirmStripeSession(token: string, sessionId: string) {
    return apiRequest<ConfirmStripeSessionResponse>("/api/v1/payments/stripe/confirm-session", {
      method: "POST",
      token,
      body: JSON.stringify({ sessionId }),
    });
  },
};
