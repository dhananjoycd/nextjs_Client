"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";

export function useRoleGuard(allowedRoles: string[]) {
  const { user, loading } = useAuth();
  const hasAccess = useMemo(() => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [allowedRoles, user]);

  return { user, loading, hasAccess };
}

