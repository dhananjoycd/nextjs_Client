"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, Search, Star } from "lucide-react";
import { Button, Card, Input, Pagination, Skeleton } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import type { Provider } from "@/lib/types";

const PAGE_SIZE = 10;

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    void fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      setLoading(true);
      const data = await apiRequest<Provider[]>("/api/v1/providers");
      setProviders(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return providers;
    return providers.filter((provider) => {
      const values = [
        provider.restaurantName,
        provider.name,
        provider.user?.name,
        provider.description,
        provider.bio,
        provider.address,
      ];
      return values.some((value) => String(value ?? "").toLowerCase().includes(query));
    });
  }, [providers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedProviders = useMemo(
    () => filteredProviders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProviders, page],
  );

  return (
    <div className="space-y-6 py-2">
      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-100 via-teal-50 to-orange-100 p-6">
        <h1 className="text-3xl md:text-4xl">Providers</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
          Browse trusted kitchens, compare specialties, and open full provider menus before placing your order.
        </p>
      </section>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Explore provider directory</h2>
            <p className="text-sm text-slate-600">Search verified kitchens by name, specialty, or location.</p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search providers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </Card>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="space-y-3">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="space-y-3 border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-700">{error}</p>
          <Button onClick={fetchProviders}>Retry</Button>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pagedProviders.map((provider) => (
            <article className="card flex h-full flex-col" key={provider.user?.id ?? provider.id}>
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Building2 className="size-5" />
              </div>
              <div className="space-y-3">
                <div>
                  <h2 className="line-clamp-1 text-xl">
                    {provider.restaurantName ?? provider.name ?? provider.user?.name ?? "Provider"}
                  </h2>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                    {provider.description ?? provider.bio ?? "Fresh meals, curated menus, and dependable delivery support."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="status-pill">{provider.address ?? "Dhaka, Bangladesh"}</span>
                  <span className="status-pill inline-flex gap-1">
                    <Star className="size-3.5 fill-current text-amber-500" /> Trusted
                  </span>
                </div>
              </div>
              <Link className="btn btn-secondary mt-4 inline-flex w-full" href={`/providers/${provider.user?.id ?? provider.id}`}>
                View Menu
              </Link>
            </article>
          ))}
          {pagedProviders.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <p className="text-sm text-slate-600">No providers match your current search.</p>
            </Card>
          )}
        </div>
      )}

      {filteredProviders.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredProviders.length}
          pageSize={PAGE_SIZE}
          itemLabel="providers"
        />
      )}
    </div>
  );
}
