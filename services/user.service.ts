import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export const userService = {
  me(token?: string | null) {
    return apiRequest<User>("/api/v1/users/me", token ? { token } : {});
  },
  updateMe(
    token: string | null | undefined,
    payload: {
      name?: string;
      phone?: string;
      address?: string;
      image?: string;
    },
  ) {
    return apiRequest<User>("/api/v1/users/me", {
      method: "PATCH",
      ...(token ? { token } : {}),
      body: JSON.stringify(payload),
    });
  },
};
