"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    router.replace(getRoleHomePath(user.role));
  }, [user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await register(form);
      setSuccess("Registration successful. Please login.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="mb-4 text-2xl">Register</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="field"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          className="field"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="field"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Show password
        </label>

        <div className="space-y-1">
          <p className="text-sm font-medium">Choose role</p>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                value="CUSTOMER"
                checked={form.role === "CUSTOMER"}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              />
              Customer
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                value="PROVIDER"
                checked={form.role === "PROVIDER"}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              />
              Provider
            </label>
          </div>
        </div>

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-teal-700">{success}</p>}
      </form>
      <p className="mt-3 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="text-teal-700 underline" href="/login">
          Login
        </Link>
      </p>
    </div>
  );
}

