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
    return apiRequest("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuthHandling: true,
    });
  },
  login(payload: { email: string; password: string }) {
    return apiRequest<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuthHandling: true,
    });
  },
  me(token?: string | null) {
    return apiRequest<User>("/api/v1/auth/me", token ? { token } : {});
  },
  session() {
    return apiRequest<User>("/api/v1/auth/me");
  },
  logout(token?: string | null) {
    return apiRequest<{ success: boolean }>("/api/v1/auth/logout", {
      method: "POST",
      token: token ?? undefined,
      skipAuthHandling: true,
    });
  },
  googleLogin(callbackURL: string) {
    return apiRequest<{ url: string; redirect: boolean }>("/api/v1/auth/google-login", {
      method: "POST",
      body: JSON.stringify({ callbackURL }),
      skipAuthHandling: true,
    });
  },
};
