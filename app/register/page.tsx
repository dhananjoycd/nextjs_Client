"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

function validatePassword(value: string) {
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(value)) return "Password must include a lowercase letter";
  if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter";
  if (!/\d/.test(value)) return "Password must include a number";
  if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a symbol";
  return undefined;
}

export default function RegisterPage() {
  const { register, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    router.replace(getRoleHomePath(user.role));
  }, [router, user]);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
    },
    onSubmit: async ({ value }) => {
      await register(value);
      toast.success("Registration successful. Please login.");
      router.push(routes.login);
    },
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="space-y-5 border-slate-200 bg-white/95 p-6">
        <div>
          <h1 className="text-3xl">Create account</h1>
          <p className="text-sm text-slate-600">Start ordering or become a provider on FoodHub.</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit().catch((error) =>
              toast.error(error instanceof Error ? error.message : "Registration failed"),
            );
          }}
        >
          <form.Field
            name="name"
            validators={{ onChange: ({ value }) => (!value ? "Full name is required" : undefined) }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="John Doe"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
                {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (!value ? "Email is required" : undefined) }}
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
                {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => validatePassword(value),
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
                    placeholder="Create password"
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
                {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account role</label>
                <Select value={field.state.value} onValueChange={field.handleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="PROVIDER">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
            {({ isSubmitting }) => (
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {isSubmitting ? "Creating account..." : "Create account"}
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
              <span className="bg-white px-2 text-slate-500">Or start with</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                loginWithGoogle().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Google signup failed"),
                );
              }}
            >
              Google
            </Button>
            <p className="text-xs text-slate-500">Google sign-up is live now. More social providers can be added later on the same auth foundation.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href={routes.login} className="font-semibold text-emerald-700 hover:text-emerald-600">
            Login
          </Link>
        </p>
      </Card>

      <Card className="hidden border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(236,253,245,0.95))] p-7 lg:block">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Build your account</p>
            <h2 className="text-4xl leading-tight">Join a food marketplace designed for customers and providers.</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Create a customer account to order faster, or choose provider access to manage your menu and incoming orders.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "Customer accounts get saved profile, order history, and checkout convenience.",
              "Provider accounts unlock menu management and delivery pipeline updates.",
              "Every account is built for responsive mobile, tablet, and desktop usage.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
