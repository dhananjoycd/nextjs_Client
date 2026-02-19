import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export const userService = {
  me(token: string) {
    return apiRequest<User>("/api/v1/users/me", { token });
  },
  updateMe(
    token: string,
    payload: {
      name?: string;
      phone?: string;
      address?: string;
      image?: string;
    },
  ) {
    return apiRequest<User>("/api/v1/users/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },
};
