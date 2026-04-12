import { apiRequest } from "@/lib/api";
import type { Category } from "@/types";

export const categoriesService = {
  list(token?: string | null) {
    return apiRequest<Category[]>("/api/v1/categories", token ? { token } : {});
  },
  create(token: string | null | undefined, payload: { name: string; description?: string; imageUrl?: string }) {
    return apiRequest<Category>("/api/v1/categories", {
      method: "POST",
      ...(token ? { token } : {}),
      body: JSON.stringify(payload),
    });
  },
  update(token: string | null | undefined, id: string, payload: { name?: string; description?: string; imageUrl?: string }) {
    return apiRequest<Category>(`/api/v1/categories/${id}`, {
      method: "PATCH",
      ...(token ? { token } : {}),
      body: JSON.stringify(payload),
    });
  },
  remove(token: string | null | undefined, id: string) {
    return apiRequest(`/api/v1/categories/${id}`, {
      method: "DELETE",
      ...(token ? { token } : {}),
    });
  },
};
