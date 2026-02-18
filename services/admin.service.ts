import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export const adminService = {
  users(token: string) {
    return apiRequest<User[]>("/api/admin/users", { token });
  },
  updateUserStatus(token: string, userId: string, status: string) {
    return apiRequest(`/api/admin/users/${userId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },
};

