"use client";

import { useAuth } from "@/components/AuthProvider";

export function useMe() {
  const { user, loading, refreshMe } = useAuth();
  return { user, loading, refreshMe };
}

