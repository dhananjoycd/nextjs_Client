import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export const adminService = {
  users(token?: string | null) {
    return apiRequest<User[]>("/api/v1/users", token ? { token } : {});
  },
  updateUserStatus(token: string | null | undefined, userId: string, status: string) {
    return apiRequest(`/api/v1/users/${userId}/status`, {
      method: "PATCH",
      ...(token ? { token } : {}),
      body: JSON.stringify({ status }),
    });
  },
};
