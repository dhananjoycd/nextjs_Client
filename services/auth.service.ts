import { apiRequest } from "@/lib/api";
import type { User } from "@/types";

export type LoginResponse = {
  accessToken?: string;
  token?: string;
  user?: User;
};

export const authService = {
  register(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return apiRequest("api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return apiRequest<LoginResponse>("api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me(token: string) {
    return apiRequest<User>("/api/v1/auth/me", { token });
  },
};
