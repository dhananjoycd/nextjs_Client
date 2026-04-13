"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath, normalizeRole } from "@/lib/auth";
import { routes } from "@/lib/routes";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

export function Protected({ children, roles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const userRole = normalizeRole(user?.role);
  const allowedRoles = roles?.map((role) => String(role).toUpperCase());

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
      router.replace(getRoleHomePath(userRole));
    }
  }, [allowedRoles, loading, router, user, userRole]);

  if (loading || !user) return <p>Loading...</p>;
  if (allowedRoles?.length && !allowedRoles.includes(userRole)) return <p>Checking access...</p>;
  return <>{children}</>;
}
