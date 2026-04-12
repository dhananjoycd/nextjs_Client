import { apiRequest } from "@/lib/api";
import type { Order } from "@/types";

export const ordersService = {
  create(
    token: string | null | undefined,
    payload: {
      deliveryAddress: string;
      note?: string;
      paymentMethod?: "COD" | "STRIPE" | string;
      scheduleType?: "NOW" | "LATER";
      scheduledAt?: string;
    },
  ) {
    return apiRequest<Order>("/api/v1/orders", {
      method: "POST",
      ...(token ? { token } : {}),
      body: JSON.stringify(payload),
    });
  },
  my(token?: string | null) {
    return apiRequest<Order[]>("/api/v1/orders/my", token ? { token } : {});
  },
  list(token?: string | null) {
    return apiRequest<Order[]>("/api/v1/orders", token ? { token } : {});
  },
  details(token: string | null | undefined, id: string) {
    return apiRequest<Order>(`/api/v1/orders/${id}`, token ? { token } : {});
  },
  updateStatus(token: string | null | undefined, id: string, status: string) {
    return apiRequest<Order>(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      ...(token ? { token } : {}),
      body: JSON.stringify({ status }),
    });
  },
};
