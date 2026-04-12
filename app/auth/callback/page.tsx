"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshMe } = useAuth();

  useEffect(() => {
    if (loading) return;

    const error = searchParams.get("error");
    if (error) {
      toast.error("Social login could not be completed. Please try again.");
      router.replace(`${routes.login}?error=${encodeURIComponent(error)}`);
      return;
    }

    if (user) {
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo?.startsWith("/")) {
        router.replace(redirectTo);
        return;
      }
      router.replace(getRoleHomePath(user.role));
      return;
    }

    let active = true;

    (async () => {
      try {
        await refreshMe();
      } catch {
        if (!active) return;
        toast.error("We could not restore your session after social login.");
        router.replace(routes.login);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, refreshMe, router, searchParams, user]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Loader2 className="size-6 animate-spin" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Finishing sign in</h1>
        <p className="text-sm text-slate-600">We are restoring your FoodHub session and sending you to the right dashboard.</p>
      </div>
    </div>
  );
}
