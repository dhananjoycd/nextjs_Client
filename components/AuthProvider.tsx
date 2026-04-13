"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AUTH_EXPIRED_EVENT } from "@/lib/api";
import { normalizeRole } from "@/lib/auth";
import { config } from "@/lib/config";
import { authService } from "@/services";
import type { User } from "@/lib/types";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_KEY = "foodhub_user";

function normalizeUser(input: unknown): User | null {
  if (!input || typeof input !== "object") return null;
  const maybeRecord = input as Record<string, unknown>;
  const candidate =
    maybeRecord.user && typeof maybeRecord.user === "object"
      ? (maybeRecord.user as Record<string, unknown>)
      : maybeRecord;

  const id = String(candidate.id ?? "").trim();
  const email = String(candidate.email ?? "").trim();
  if (!id || !email) return null;

  return {
    ...(candidate as User),
    id,
    email,
    name: String(candidate.name ?? "").trim(),
    role: normalizeRole(candidate.role as User["role"]),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("foodhub_token");
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      const savedUser = localStorage.getItem(USER_KEY);
      localStorage.removeItem("foodhub_token");

      if (savedUser && active) {
        try {
          const parsedUser = normalizeUser(JSON.parse(savedUser));
          if (parsedUser) {
            setUser(parsedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(parsedUser));
          } else {
            localStorage.removeItem(USER_KEY);
          }
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      try {
        const me = await authService.session();
        if (!active) return;
        const normalized = normalizeUser(me);
        if (normalized) {
          setUser(normalized);
          localStorage.setItem(USER_KEY, JSON.stringify(normalized));
        } else {
          setUser(null);
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void hydrateSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthState();
      toast.error("Your session expired. Please login again.");
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [clearAuthState]);

  const login = async (email: string, password: string): Promise<User> => {
    const payload = await authService.login({ email, password });
    const accessToken = payload.accessToken ?? payload.token;
    const rawUser = payload.user ?? (accessToken ? await authService.me(accessToken) : await authService.session());
    const nextUser = normalizeUser(rawUser);
    if (!nextUser) {
      throw new Error("Could not read user profile from login response");
    }
    setToken(accessToken ?? null);
    localStorage.removeItem("foodhub_token");
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout(token);
    } catch {
      // Clear local auth state even if server logout fails.
    }
    clearAuthState();
  }, [clearAuthState, token]);

  const loginWithGoogle = useCallback(async () => {
    if (typeof window === "undefined") return;
    const payload = await authService.googleLogin(config.authCallbackUrl);
    if (!payload.url) {
      throw new Error("Google login is not configured");
    }
    window.location.assign(payload.url);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authService.session();
      const normalized = normalizeUser(me);
      if (!normalized) {
        throw new Error("Invalid session user");
      }
      setUser(normalized);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    } catch {
      await logout();
    }
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, loginWithGoogle, refreshMe }),
    [user, token, loading, logout, loginWithGoogle, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
