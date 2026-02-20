"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button, Card, Input } from "@/components/ui";
import { userService } from "@/services";

export default function ProfilePage() {
  const { token, refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [initial, setInitial] = useState({
    name: "",
    phone: "",
    address: "",
    image: "",
  });

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await userService.me(token);
      setEmail(me.email ?? "");
      setInitial({
        name: me.name ?? "",
        phone: me.phone ?? "",
        address: me.address ?? "",
        image: me.image ?? "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const key = useMemo(() => JSON.stringify(initial), [initial]);

  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      if (!token) throw new Error("Please login again");
      const payload = {
        name: value.name.trim(),
        phone: value.phone.trim(),
        address: value.address.trim(),
        image: value.image.trim(),
      };
      await userService.updateMe(token, payload);
      await refreshMe();
      await loadProfile();
      toast.success("Profile updated successfully");
    },
  });

  return (
    <Protected roles={["CUSTOMER"]}>
      <DashboardShell
        title="Profile Settings"
        description="Manage your account details and delivery profile."
        hideNav
        links={[
          { href: "/cart", label: "Cart" },
          { href: "/orders", label: "Orders" },
          { href: "/profile", label: "Profile", active: true },
        ]}
      >
        {loading ? (
          <Card>
            <p>Loading profile...</p>
          </Card>
        ) : (
          <Card className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email</p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{email}</p>
            </div>

            <form
              key={key}
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Failed to update profile"),
                );
              }}
            >
              <form.Field
                name="name"
                validators={{ onChange: ({ value }) => (!value ? "Name is required" : undefined) }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
                  </div>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      placeholder="+8801XXXXXXXXX"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="address">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      placeholder="Your delivery address"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="image">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Profile image URL</label>
                    <Input
                      placeholder="https://..."
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                {({ isSubmitting }) => (
                  <Button disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </Card>
        )}
      </DashboardShell>
    </Protected>
  );
}
