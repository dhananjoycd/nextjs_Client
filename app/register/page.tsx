"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { getRoleHomePath } from "@/lib/auth";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();

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
      router.push("/login");
    },
  });

  return (
    <div className="mx-auto max-w-md py-8">
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
              onChange: ({ value }) => (value.length < 6 ? "Password must be at least 6 characters" : undefined),
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
                    placeholder="Create password"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
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

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
