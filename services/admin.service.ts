import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export const adminService = {
  users(token: string) {
    return apiRequest<User[]>("/api/v1/users", { token });
  },
  updateUserStatus(token: string, userId: string, status: string) {
    return apiRequest(`/api/v1/users/${userId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },
};
