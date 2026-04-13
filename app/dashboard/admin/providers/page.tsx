"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { adminService, providersService } from "@/services";
import { Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination, Switch } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, includesText } from "@/app/dashboard/admin/_shared";
import type { Provider, User } from "@/types";

export default function AdminProvidersPage() {
  const { token, loading: authLoading } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const fetchProviders = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const [providerList, userList] = await Promise.all([providersService.list(), adminService.users(token)]);
      setProviders(Array.isArray(providerList) ? providerList : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load providers");
      setProviders([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  const userMap = useMemo(() => {
    return new Map(users.map((user) => [user.id, user]));
  }, [users]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const owner = provider.user?.id ? userMap.get(provider.user.id) : undefined;
      if (!search.trim()) return true;
      return (
        includesText(provider.name, search) ||
        includesText(provider.restaurantName, search) ||
        includesText(provider.cuisine, search) ||
        includesText(provider.user?.name, search) ||
        includesText(owner?.email, search)
      );
    });
  }, [providers, search, userMap]);

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / ADMIN_PAGE_SIZE));
  const pagedProviders = useMemo(
    () => filteredProviders.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredProviders, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  async function toggleProviderUserStatus(provider: Provider, active: boolean) {
    if (!token || !provider.user?.id) return;
    try {
      await adminService.updateUserStatus(token, provider.user.id, active ? "ACTIVE" : "SUSPENDED");
      setUsers((prev) => prev.map((user) => (user.id === provider.user?.id ? { ...user, status: active ? "ACTIVE" : "SUSPENDED" } : user)));
      toast.success(`Provider ${active ? "activated" : "suspended"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update provider status");
    }
  }

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Providers" description="Manage provider accounts and business profiles." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <Input
            placeholder="Search provider, restaurant, cuisine, owner"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {loading ? (
            <p className="text-sm text-slate-600">Loading providers...</p>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pagedProviders.map((provider) => {
                  const owner = provider.user?.id ? userMap.get(provider.user.id) : undefined;
                  const active = (owner?.status ?? "ACTIVE") !== "SUSPENDED";
                  return (
                    <article key={provider.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-lg font-semibold">{provider.restaurantName ?? provider.name ?? "Provider"}</p>
                      <p className="text-sm text-slate-600">Owner: {provider.user?.name ?? owner?.name ?? "-"}</p>
                      <p className="text-sm text-slate-600">Email: {owner?.email ?? "-"}</p>
                      <p className="text-sm text-slate-600">Cuisine: {provider.cuisine ?? "-"}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedProvider(provider)}>
                          View
                        </Button>
                        {provider.user?.id ? (
                          <Switch checked={active} onCheckedChange={(value) => toggleProviderUserStatus(provider, value)} />
                        ) : null}
                      </div>
                    </article>
                  );
                })}
                {pagedProviders.length === 0 && <p className="text-sm text-slate-500">No providers found.</p>}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredProviders.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="providers"
              />
            </>
          )}
        </Card>

        <Dialog open={Boolean(selectedProvider)} onOpenChange={(open) => !open && setSelectedProvider(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provider Details</DialogTitle>
            </DialogHeader>
            {selectedProvider ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Business Name:</span> {selectedProvider.name ?? "-"}</p>
                <p><span className="font-medium">Restaurant:</span> {selectedProvider.restaurantName ?? "-"}</p>
                <p><span className="font-medium">Owner:</span> {selectedProvider.user?.name ?? "-"}</p>
                <p><span className="font-medium">Cuisine:</span> {selectedProvider.cuisine ?? "-"}</p>
                <p><span className="font-medium">Address:</span> {selectedProvider.address ?? "-"}</p>
                <p><span className="font-medium">Bio:</span> {selectedProvider.bio ?? "-"}</p>
                <p><span className="font-medium">Description:</span> {selectedProvider.description ?? "-"}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
