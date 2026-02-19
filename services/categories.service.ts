import { apiRequest } from "@/lib/api";
import type { Category } from "@/types";

export const categoriesService = {
  list(token?: string) {
    return apiRequest<Category[]>("/api/v1/categories", { token });
  },
  create(token: string, payload: { name: string; description?: string }) {
    return apiRequest<Category>("/api/v1/categories", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  update(token: string, id: string, payload: { name?: string; description?: string }) {
    return apiRequest<Category>(`/api/v1/categories/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
  remove(token: string, id: string) {
    return apiRequest(`/api/v1/categories/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
