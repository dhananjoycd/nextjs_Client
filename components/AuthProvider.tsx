"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
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
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "foodhub_token";
const USER_KEY = "foodhub_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const payload = await apiRequest<{ accessToken?: string; token?: string; user?: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    const accessToken = payload.accessToken ?? payload.token;
    if (!accessToken) throw new Error("No auth token returned from API");
    const nextUser = payload.user ?? (await apiRequest<User>("/api/auth/me", { token: accessToken }));
    setToken(accessToken);
    localStorage.setItem(TOKEN_KEY, accessToken);
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const register = async (payload: RegisterPayload) => {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await apiRequest<User>("/api/auth/me", { token });
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {
      logout();
    }
  }, [logout, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshMe }),
    [user, token, loading, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
