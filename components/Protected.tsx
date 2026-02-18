"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  roles?: string[];
};

export function Protected({ children, roles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles?.length && !roles.includes(user.role)) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [user, loading, roles, router]);

  if (loading || !user) return <p>Loading...</p>;
  if (roles?.length && !roles.includes(user.role)) return <p>Checking access...</p>;
  return <>{children}</>;
}
