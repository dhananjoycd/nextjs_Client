"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { userService } from "@/services";
import type { Provider } from "@/types";

const PROVIDER_NAV_LINKS = [
  { href: "/dashboard/provider", label: "Dashboard" },
  { href: "/dashboard/provider/meals", label: "Manage Meals" },
  { href: "/dashboard/provider/orders", label: "Order Queue" },
  { href: "/dashboard/provider/earnings", label: "Earnings" },
  { href: "/dashboard/provider/profile", label: "Business Profile" },
];

type ProfileFormState = {
  businessName: string;
  restaurantName: string;
  cuisine: string;
  phone: string;
  address: string;
  bio: string;
  description: string;
};

const EMPTY_FORM: ProfileFormState = {
  businessName: "",
  restaurantName: "",
  cuisine: "",
  phone: "",
  address: "",
  bio: "",
  description: "",
};

function mapProviderToForm(provider: Provider | null): ProfileFormState {
  if (!provider) return EMPTY_FORM;
  return {
    businessName: provider.name ?? provider.user?.name ?? "",
    restaurantName: provider.restaurantName ?? "",
    cuisine: provider.cuisine ?? "",
    phone: provider.user?.phone ?? "",
    address: provider.address ?? provider.user?.address ?? "",
    bio: provider.bio ?? "",
    description: provider.description ?? "",
  };
}

export default function BusinessProfilePage() {
  const { user, token, loading: authLoading, refreshMe } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);

  useEffect(() => {
    if (authLoading || !token || !user) return;

    const fetchProfile = async () => {
      try {
        const providerEndpoints = [
          { url: `/api/v1/providers/${user.id}`, skipAuthHandling: false },
          { url: "/api/v1/providers/me", skipAuthHandling: true },
        ];
        let data: Provider | null = null;
        for (const endpoint of providerEndpoints) {
          try {
            const result = await apiRequest<Provider>(endpoint.url, {
              token,
              skipAuthHandling: endpoint.skipAuthHandling,
            });
            data = result;
            break;
          } catch {
            continue;
          }
        }
        setProvider(
          data ||
            ({
              id: user.id,
              name: user.name,
              address: user.address,
              user: {
                ...user,
              },
            } as Provider),
        );
      } catch {
        setProvider({
          id: user.id,
          name: user.name,
          address: user.address,
          user: {
            ...user,
          },
        } as Provider);
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [user, token, authLoading]);

  useEffect(() => {
    if (!provider || editing) return;
    setForm(mapProviderToForm(provider));
  }, [provider, editing]);

  function updateFormField<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditStart() {
    setForm(mapProviderToForm(provider));
    setEditing(true);
  }

  function handleCancelEdit() {
    setForm(mapProviderToForm(provider));
    setEditing(false);
  }

  async function saveProfile() {
    if (!token || !provider) return;

    const providerPayload = {
      name: form.businessName.trim() || undefined,
      restaurantName: form.restaurantName.trim() || undefined,
      cuisine: form.cuisine.trim() || undefined,
      address: form.address.trim() || undefined,
      bio: form.bio.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    const userPayload = {
      name: form.businessName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
    };

    try {
      setSaving(true);

      let updatedProvider: Provider | null = null;
      const providerUpdateEndpoints = [
        { url: `/api/v1/providers/${provider.id}`, skipAuthHandling: false },
        { url: "/api/v1/providers/me", skipAuthHandling: true },
      ];

      for (const endpoint of providerUpdateEndpoints) {
        try {
          const result = await apiRequest<Provider>(endpoint.url, {
            method: "PATCH",
            token,
            skipAuthHandling: endpoint.skipAuthHandling,
            body: JSON.stringify(providerPayload),
          });
          updatedProvider = result;
          break;
        } catch {
          continue;
        }
      }

      try {
        await userService.updateMe(token, userPayload);
      } catch {
        // Provider profile update can still succeed even if user patch is blocked.
      }

      const nextProvider: Provider =
        updatedProvider ??
        {
          ...provider,
          ...providerPayload,
          user: {
            ...provider.user,
            name: userPayload.name ?? provider.user?.name ?? user?.name ?? provider.name ?? "Provider",
            phone: userPayload.phone ?? provider.user?.phone,
            address: userPayload.address ?? provider.user?.address,
            email: provider.user?.email ?? user?.email ?? "",
            role: provider.user?.role ?? user?.role ?? "PROVIDER",
            id: provider.user?.id ?? user?.id ?? provider.id,
          },
        };

      setProvider(nextProvider);
      setForm(mapProviderToForm(nextProvider));
      setEditing(false);
      await refreshMe();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Business Profile"
        description="Manage your business information and settings"
        links={PROVIDER_NAV_LINKS}
      >
        <div className="space-y-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">Loading profile...</p>
            </Card>
          ) : provider ? (
            <Card className="max-w-3xl p-6">
              <div className="space-y-4">
                {!editing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Business Name</label>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {provider.name ?? provider.user?.name ?? "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Restaurant Name</label>
                      <p className="mt-1 text-slate-900">{provider.restaurantName ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="mt-1 text-slate-900">{provider.user?.email ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <p className="mt-1 text-slate-900">{provider.user?.phone ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Cuisine</label>
                      <p className="mt-1 text-slate-900">{provider.cuisine ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <p className="mt-1 text-slate-900">{provider.address || provider.user?.address || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Short Bio</label>
                      <p className="mt-1 whitespace-pre-wrap text-slate-900">{provider.bio ?? "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Description</label>
                      <p className="mt-1 whitespace-pre-wrap text-slate-900">{provider.description ?? "Not set"}</p>
                    </div>
                    <Button onClick={handleEditStart}>Edit Profile</Button>
                  </>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Business Name</label>
                        <Input
                          value={form.businessName}
                          onChange={(event) => updateFormField("businessName", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Restaurant Name</label>
                        <Input
                          value={form.restaurantName}
                          onChange={(event) => updateFormField("restaurantName", event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Email</label>
                        <Input value={provider.user?.email ?? ""} disabled />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Phone</label>
                        <Input value={form.phone} onChange={(event) => updateFormField("phone", event.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Cuisine</label>
                        <Input value={form.cuisine} onChange={(event) => updateFormField("cuisine", event.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">Address</label>
                        <Input value={form.address} onChange={(event) => updateFormField("address", event.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Short Bio</label>
                      <Textarea value={form.bio} onChange={(event) => updateFormField("bio", event.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-600">Description</label>
                      <Textarea
                        value={form.description}
                        onChange={(event) => updateFormField("description", event.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button type="button" onClick={saveProfile} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600">Unable to load provider profile.</p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </Protected>
  );
}
