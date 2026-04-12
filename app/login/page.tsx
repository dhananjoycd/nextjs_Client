"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input } from "@/components/ui";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

const demoUsers = [
  { label: "Customer Demo", email: "rahim.uddin@gmail.com", password: "Test@1234" },
  { label: "Provider Demo", email: "dhakabiryani@foodhub.com", password: "Test@1234" },
  { label: "Admin Demo", email: "admin@foodhub.com", password: "Test@1234" },
] as const;

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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

  function applyDemoCredential(email: string, password: string) {
    form.setFieldValue("email", email);
    form.setFieldValue("password", password);
    toast.success("Demo credential added");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="hidden border-slate-200/80 bg-[linear-gradient(180deg,rgba(16,185,129,0.1),rgba(255,255,255,0.95))] p-7 lg:block">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Welcome back</p>
            <h1 className="text-4xl leading-tight">Sign in to continue your ordering flow without friction.</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Track live orders, manage saved addresses, and jump back into your dashboard in seconds.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "Live order tracking from placement to delivery",
              "Saved address and one-page checkout experience",
              "Role-based dashboards for customer, provider, and admin",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-5 border-slate-200 bg-white/95 p-6">
        <div>
          <h1 className="text-3xl">Welcome back</h1>
          <p className="text-sm text-slate-600">Login to continue ordering with FoodHub.</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Demo access</p>
            <p className="text-xs text-slate-600">Click once to auto-fill credentials for fast review.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {demoUsers.map((demo) => (
              <Button
                key={demo.label}
                type="button"
                variant="outline"
                onClick={() => applyDemoCredential(demo.email, demo.password)}
              >
                {demo.label}
              </Button>
            ))}
          </div>
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
                    className="pl-9 pr-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
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

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                loginWithGoogle().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Google login failed"),
                );
              }}
            >
              Google
            </Button>
            <p className="text-xs text-slate-500">Google social sign-in is enabled. Additional providers can be connected later without changing this flow.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          New to FoodHub?{" "}
          <Link href={routes.register} className="font-semibold text-emerald-700 hover:text-emerald-600">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
