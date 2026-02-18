import { apiRequest } from "@/lib/api";
import type { Meal } from "@/types";

export const mealsService = {
  list(query = "") {
    return apiRequest<Meal[]>(`/api/v1/meals${query ? `?${query}` : ""}`);
  },
  details(id: string) {
    return apiRequest<Meal>(`/api/v1/meals/${id}`);
  },
};
