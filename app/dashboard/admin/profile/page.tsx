"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input } from "@/components/ui";
import { userService } from "@/services";
import { ADMIN_NAV_LINKS } from "@/app/dashboard/admin/_shared";

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
  image: string;
};

const EMPTY_PROFILE: ProfileForm = {
  name: "",
  phone: "",
  address: "",
  image: "",
};

export default function AdminProfilePage() {
  const { user, token, loading: authLoading, refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);

  useEffect(() => {
    if (authLoading || !token) return;

    const fetchMe = async () => {
      try {
        const me = await userService.me(token);
        setForm({
          name: me.name ?? "",
          phone: me.phone ?? "",
          address: me.address ?? "",
          image: me.image ?? "",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load profile");
        setForm({
          name: user?.name ?? "",
          phone: user?.phone ?? "",
          address: user?.address ?? "",
          image: user?.image ?? "",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchMe();
  }, [authLoading, token, user]);

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetFromUser() {
    setForm({
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      image: user?.image ?? "",
    });
  }

  async function saveProfile() {
    if (!token) return;
    try {
      setSaving(true);
      await userService.updateMe(token, {
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        image: form.image.trim() || undefined,
      });
      await refreshMe();
      toast.success("Profile updated");
      setEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Profile" description="Manage your admin account details." links={ADMIN_NAV_LINKS}>
        {loading ? (
          <Card className="p-8 text-center text-sm text-slate-600">Loading profile...</Card>
        ) : (
          <Card className="max-w-2xl space-y-4 p-6">
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="mt-1 text-slate-900">{user?.email ?? "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Role</label>
              <p className="mt-1 text-slate-900">{user?.role ?? "-"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Name</label>
              <Input value={form.name} disabled={!editing} onChange={(e) => updateField("name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <Input value={form.phone} disabled={!editing} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Address</label>
              <Input value={form.address} disabled={!editing} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Profile Image URL</label>
              <Input value={form.image} disabled={!editing} onChange={(e) => updateField("image", e.target.value)} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              ) : (
                <>
                  <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetFromUser();
                      setEditing(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </DashboardShell>
    </Protected>
  );
}
