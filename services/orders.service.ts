import { apiRequest } from "@/lib/api";
import type { Order } from "@/types";

export const ordersService = {
  list(token: string) {
    return apiRequest<Order[]>("/api/orders", { token });
  },
  details(token: string, id: string) {
    return apiRequest<Order>(`/api/orders/${id}`, { token });
  },
};

