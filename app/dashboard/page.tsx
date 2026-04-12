"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    router.replace(getRoleHomePath(user.role));
  }, [loading, router, user]);

  return <p className="py-10 text-center text-sm text-slate-600">Loading your dashboard...</p>;
}
