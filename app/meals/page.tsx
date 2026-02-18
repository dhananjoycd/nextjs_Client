"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MealCard } from "@/components/home";
import { Badge, Button, Card, Input, Skeleton } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import type { Meal } from "@/types";

const PAGE_SIZE = 8;

type FilterState = {
  query: string;
  category: string;
  cuisine: string;
  dietary: string;
  provider: string;
  minPrice: string;
  maxPrice: string;
};

export default function MealsPage() {
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    category: "",
    cuisine: "",
    dietary: "",
    provider: "",
    minPrice: "",
    maxPrice: "",
  });

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest<Meal[]>("/api/v1/meals");
      setAllMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meals");
    } finally {
      setLoading(false);
    }
  }, []);

  console.log(fetchMeals, "meeeeeeels");
  

  useEffect(() => {
    void fetchMeals();
  }, [fetchMeals]);

  const filtered = useMemo(() => {
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER);

    const list = allMeals.filter((meal) => {
      const name = (meal.name ?? meal.title ?? "").toLowerCase();
      const category = String(meal.category ?? "").toLowerCase();
      const description = String(meal.description ?? "").toLowerCase();
      const provider = String(meal.provider?.name ?? "").toLowerCase();

      if (filters.query && !name.includes(filters.query.toLowerCase())) return false;
      if (filters.category && category !== filters.category.toLowerCase()) return false;
      if (filters.cuisine && !description.includes(filters.cuisine.toLowerCase())) return false;
      if (filters.dietary && !description.includes(filters.dietary.toLowerCase())) return false;
      if (filters.provider && !provider.includes(filters.provider.toLowerCase())) return false;
      if (Number(meal.price) < min || Number(meal.price) > max) return false;
      return true;
    });

    if (sort === "price_asc") return list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_desc") return list.sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [allMeals, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedMeals = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateFilter(key: keyof FilterState, value: string) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setPage(1);
    setFilters({
      query: "",
      category: "",
      cuisine: "",
      dietary: "",
      provider: "",
      minPrice: "",
      maxPrice: "",
    });
  }

  return (
    <div className="space-y-8 py-2">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-100/90 via-amber-50 to-orange-100/90 p-6 shadow-lg">
        <div className="absolute -right-14 -top-10 h-44 w-44 rounded-full bg-white/50 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-white/70 text-emerald-800">Freshly curated</Badge>
            <h1 className="text-3xl md:text-4xl">Browse Meals</h1>
            <p className="max-w-xl text-sm text-slate-700">
              Discover meals from trusted providers. Filter by taste, budget, and dietary needs.
            </p>
          </div>
          <div className="text-sm text-slate-700">
            <span className="status-pill bg-white/70">{filtered.length} meals found</span>
          </div>
        </div>
      </section>

      <Card className="space-y-4 border-emerald-100 bg-white/95">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">Filter Meals</h2>
          <select className="field max-w-[240px]" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Sort: Price Low to High</option>
            <option value="price_desc">Sort: Price High to Low</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Search meal name" value={filters.query} onChange={(e) => updateFilter("query", e.target.value)} />
          <Input placeholder="Category" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)} />
          <Input placeholder="Cuisine" value={filters.cuisine} onChange={(e) => updateFilter("cuisine", e.target.value)} />
          <Input placeholder="Dietary" value={filters.dietary} onChange={(e) => updateFilter("dietary", e.target.value)} />
          <Input placeholder="Provider" value={filters.provider} onChange={(e) => updateFilter("provider", e.target.value)} />
          <Input placeholder="Min price" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} />
          <Input placeholder="Max price" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
          <Button variant="outline" onClick={clearFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-0">
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-28" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && pagedMeals.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={{
                  id: meal.id,
                  name: meal.name,
                  title: meal.title,
                  imageUrl: meal.imageUrl,
                  price: meal.price,
                  rating: (meal as Meal & { rating?: number }).rating,
                  provider: meal.provider
                    ? { id: meal.provider.id, name: meal.provider.name }
                    : undefined,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <span className="status-pill bg-white">Page {page}</span>
            <span className="text-sm text-slate-600">of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}

      {!loading && error && (
        <Card className="space-y-3 border-red-100 bg-red-50/50">
          <h2 className="text-xl text-red-700">Unable to load meals</h2>
          <p className="text-sm text-red-700/80">{error}</p>
          <Button variant="secondary" onClick={fetchMeals}>
            Retry
          </Button>
        </Card>
      )}

      {!loading && !error && pagedMeals.length === 0 && (
        <Card className="space-y-3 border-amber-100 bg-amber-50/60">
          <h2 className="text-xl">No meals found</h2>
          <p className="text-sm text-slate-700">Try different filters or clear all search conditions.</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={fetchMeals}>
              Reload
            </Button>
          </div>
        </Card>
      )}

      <section className="rounded-2xl border border-emerald-100 bg-white/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">Want to explore providers directly?</h2>
            <p className="text-sm text-slate-600">Check top kitchens and their full menu collections.</p>
          </div>
          <Button asChild>
            <Link href="/providers">Explore Providers</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
