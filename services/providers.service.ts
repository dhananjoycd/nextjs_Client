import { apiRequest } from "@/lib/api";
import type { Provider } from "@/types";

export const providersService = {
  list() {
    return apiRequest<Provider[]>("/api/v1/providers");
  },
  details(id: string) {
    return apiRequest<Provider>(`/api/v1/providers/${id}`);
  },
};
