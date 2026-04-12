"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AUTH_EXPIRED_EVENT } from "@/lib/api";
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
          setUser(JSON.parse(savedUser) as User);
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      try {
        const me = await authService.session();
        if (!active) return;
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
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
    const nextUser = payload.user ?? (accessToken ? await authService.me(accessToken) : await authService.session());
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
    const callbackURL = `${window.location.origin}/auth/callback`;
    const payload = await authService.googleLogin(callbackURL);
    if (!payload.url) {
      throw new Error("Google login is not configured");
    }
    window.location.assign(payload.url);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authService.session();
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
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
