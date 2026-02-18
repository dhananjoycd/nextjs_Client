import { apiRequest } from "@/lib/api";
import type { Provider } from "@/types";

export const providersService = {
  list() {
    return apiRequest<Provider[]>("/api/providers");
  },
  details(id: string) {
    return apiRequest<Provider>(`/api/providers/${id}`);
  },
};

