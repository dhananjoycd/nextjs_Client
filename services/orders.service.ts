import { apiRequest } from "@/lib/api";
import type { Order } from "@/types";

export const ordersService = {
  create(
    token: string,
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
      token,
      body: JSON.stringify(payload),
    });
  },
  my(token: string) {
    return apiRequest<Order[]>("/api/v1/orders/my", { token });
  },
  list(token: string) {
    return apiRequest<Order[]>("/api/v1/orders", { token });
  },
  details(token: string, id: string) {
    return apiRequest<Order>(`/api/v1/orders/${id}`, { token });
  },
  updateStatus(token: string, id: string, status: string) {
    return apiRequest<Order>(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },
};
