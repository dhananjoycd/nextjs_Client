import { apiRequest } from "@/lib/api";

type StripeCheckoutPayload = {
  deliveryAddress: string;
  note?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type StripeCheckoutResponse = {
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
};

export const paymentsService = {
  createStripeCheckoutSession(token: string, payload: StripeCheckoutPayload) {
    return apiRequest<StripeCheckoutResponse>("/api/v1/payments/stripe/checkout-session", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
};

