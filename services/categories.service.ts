import { apiRequest } from "@/lib/api";
import type { Category } from "@/types";

export const categoriesService = {
  list() {
    return apiRequest<Category[]>("/api/categories");
  },
};

