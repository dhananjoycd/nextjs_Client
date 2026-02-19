"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { Provider } from "@/lib/types";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Providers</h1>
      {loading && <p>Loading providers...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid-cards">
        {providers.map((provider) => (
          <article className="card" key={provider.user?.id ?? provider.id}>
            <h2 className="text-xl">
              {provider.restaurantName ?? provider.name ?? provider.user?.name ?? "Provider"}
            </h2>
            <p className="text-sm text-slate-600">{provider.description ?? provider.bio ?? "No bio added yet."}</p>
            <Link className="btn btn-secondary mt-3 inline-block" href={`/providers/${provider.user?.id ?? provider.id}`}>
              View Menu
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
