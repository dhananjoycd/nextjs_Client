"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input } from "@/components/ui";
import { getRoleHomePath } from "@/lib/auth";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const loggedInUser = await login(value.email, value.password);
      toast.success("Logged in successfully");
      router.push(getRoleHomePath(loggedInUser.role));
    },
  });

  useEffect(() => {
    if (!user) return;
    router.replace(getRoleHomePath(user.role));
  }, [router, user]);

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="space-y-5 border-slate-200 bg-white/95 p-6">
        <div>
          <h1 className="text-3xl">Welcome back</h1>
          <p className="text-sm text-slate-600">Login to continue ordering with FoodHub.</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit().catch((error) =>
              toast.error(error instanceof Error ? error.message : "Login failed"),
            );
          }}
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!value ? "Email is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? "Password is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Enter password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
                {field.state.meta.errors[0] && (
                  <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
            {({ isSubmitting }) => (
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-sm text-slate-600">
          New to FoodHub?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
