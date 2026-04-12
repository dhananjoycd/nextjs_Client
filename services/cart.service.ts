import { apiRequest } from "@/lib/api";

type CartMeal = {
  id: string;
  title?: string;
  name?: string;
  price: number | string;
  imageUrl?: string;
  provider?: { id: string; name?: string };
};

export type ServerCartItem = {
  id: string;
  mealId: string;
  quantity: number;
  meal: CartMeal;
};

export type ServerCart = {
  items: ServerCartItem[];
  totalAmount: number | string;
};

export const cartService = {
  get(token?: string | null) {
    return apiRequest<ServerCart>("/api/v1/cart", token ? { token } : {});
  },
  add(token: string | null | undefined, payload: { mealId: string; quantity?: number }) {
    return apiRequest<ServerCartItem>("/api/v1/cart", {
      method: "POST",
      ...(token ? { token } : {}),
      body: JSON.stringify(payload),
    });
  },
  update(token: string | null | undefined, id: string, quantity: number) {
    return apiRequest<ServerCartItem>(`/api/v1/cart/${id}`, {
      method: "PATCH",
      ...(token ? { token } : {}),
      body: JSON.stringify({ quantity }),
    });
  },
  remove(token: string | null | undefined, id: string) {
    return apiRequest(`/api/v1/cart/${id}`, {
      method: "DELETE",
      ...(token ? { token } : {}),
    });
  },
};
