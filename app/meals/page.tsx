"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  Input,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { addMealToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { Meal } from "@/types";

const PAGE_SIZE = 10;

type SortValue = "recommended" | "price_low_high" | "price_high_low" | "name_asc";

function toTagList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => toTagList(item));
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return [record.name];
    if (typeof record.label === "string") return [record.label];
    return [];
  }

  return [String(value)];
}

function mealTags(meal: Meal): string[] {
  const unique = new Set(
    [
      ...toTagList(meal.tags),
      ...toTagList(meal.cuisine),
      ...toTagList(meal.dietary),
      ...toTagList(meal.dietaryPreferences),
    ]
      .map((value) => value.trim())
      .filter(Boolean),
  );

  return Array.from(unique).slice(0, 3);
}

function mealCategory(meal: Meal): string {
  if (!meal.category) return "";
  if (typeof meal.category === "string") return meal.category.trim();
  return String(meal.category.name ?? meal.category.slug ?? "").trim();
}

export default function MealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest<Meal[]>("/api/v1/meals?limit=100");
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meals");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMeals();
  }, [fetchMeals]);

  useEffect(() => {
    const query = (searchParams.get("search") ?? "").trim();
    setSearchFilter(query);

    const categoryQuery = (searchParams.get("category") ?? "").trim();
    if (categoryQuery) {
      setCategoryFilter(categoryQuery);
    }
  }, [searchParams]);

  const preparedMeals = useMemo(
    () =>
      meals.map((meal) => ({
        ...meal,
        title: meal.name ?? meal.title ?? "Meal",
        tags: mealTags(meal),
        categoryLabel: mealCategory(meal),
        providerName: meal.provider?.name ?? "Provider",
      })),
    [meals],
  );

  const categoryOptions = useMemo(() => {
    const values = new Set<string>();
    for (const meal of preparedMeals) {
      if (meal.categoryLabel) values.add(meal.categoryLabel);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [preparedMeals]);

  const filteredMeals = useMemo(() => {
    const minPrice = minPriceFilter.trim() ? Number(minPriceFilter) : undefined;
    const maxPrice = maxPriceFilter.trim() ? Number(maxPriceFilter) : undefined;
    const searchText = searchFilter.trim().toLowerCase();

    return preparedMeals.filter((meal) => {
      if (searchText) {
        const matchesSearch =
          String(meal.title ?? "").toLowerCase().includes(searchText) ||
          String(meal.providerName ?? "").toLowerCase().includes(searchText) ||
          meal.tags.some((tag) => tag.toLowerCase().includes(searchText));
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== "ALL" && meal.categoryLabel !== categoryFilter) return false;

      const price = Number(meal.price ?? 0);
      if (minPrice !== undefined && Number.isFinite(minPrice) && price < minPrice) return false;
      if (maxPrice !== undefined && Number.isFinite(maxPrice) && price > maxPrice) return false;

      return true;
    });
  }, [categoryFilter, maxPriceFilter, minPriceFilter, preparedMeals, searchFilter]);

  const sortedMeals = useMemo(() => {
    const list = [...filteredMeals];
    if (sortBy === "price_low_high") {
      return list.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    }
    if (sortBy === "price_high_low") {
      return list.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    }
    if (sortBy === "name_asc") {
      return list.sort((a, b) => String(a.title ?? "").localeCompare(String(b.title ?? "")));
    }
    return list;
  }, [filteredMeals, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedMeals.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [searchFilter, categoryFilter, minPriceFilter, maxPriceFilter, sortBy]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedMeals = useMemo(() => sortedMeals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [sortedMeals, page]);

  function clearFilters() {
    setCategoryFilter("ALL");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setSearchFilter("");
  }

  const activeFilterCount =
    (searchFilter.trim() ? 1 : 0) +
    (categoryFilter !== "ALL" ? 1 : 0) +
    (minPriceFilter.trim() ? 1 : 0) +
    (maxPriceFilter.trim() ? 1 : 0);

  function handleAddToCart(meal: Meal) {
    addMealToCart(meal, 1);
    toast.success("Added to cart");
    router.push("/cart");
  }

  return (
    <div className="space-y-6 py-2">
      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-100 via-amber-50 to-orange-100 p-6">
        <h1 className="text-3xl md:text-4xl">Meals</h1>
        <p className="mt-2 text-sm text-slate-700">Discover delicious meals and start your order in one click.</p>
      </section>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="space-y-3 p-0">
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="space-y-3 border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-700">{error}</p>
          <Button onClick={fetchMeals}>Retry</Button>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card className="space-y-4 border-slate-200/90">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-xl">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm ring-1 ring-emerald-100/60 transition-all focus-within:ring-2 focus-within:ring-emerald-300">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search meals, providers, or tags"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-11 border-0 bg-transparent pl-10 pr-16 shadow-none focus-visible:ring-0"
                    aria-label="Search meals"
                  />
                  {searchFilter.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2 top-1/2 inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 -translate-y-1/2 transition-colors hover:bg-slate-50"
                      aria-label="Clear search"
                    >
                      <X className="size-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortValue)}>
                  <SelectTrigger className="w-full sm:w-48" aria-label="Sort meals">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                    <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto lg:hidden"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                >
                  <SlidersHorizontal className="size-4" />
                  {showMobileFilters ? "Hide Filters" : "Show Filters"}
                </Button>

                <Button type="button" variant="outline" onClick={clearFilters} disabled={activeFilterCount === 0}>
                  Clear all
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-700">{sortedMeals.length} meals</p>
              {searchFilter.trim() && (
                <Badge className="inline-flex items-center gap-1 bg-slate-100 text-slate-700">
                  Search: {searchFilter.trim()}
                  <button
                    type="button"
                    onClick={() => setSearchFilter("")}
                    className="rounded p-0.5 hover:bg-slate-200"
                    aria-label="Remove search filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {categoryFilter !== "ALL" && (
                <Badge className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800">
                  Category: {categoryFilter}
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("ALL")}
                    className="rounded p-0.5 hover:bg-emerald-200"
                    aria-label="Remove category filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {minPriceFilter.trim() && (
                <Badge className="inline-flex items-center gap-1 bg-amber-100 text-amber-800">
                  Min: ${minPriceFilter}
                  <button
                    type="button"
                    onClick={() => setMinPriceFilter("")}
                    className="rounded p-0.5 hover:bg-amber-200"
                    aria-label="Remove min price filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {maxPriceFilter.trim() && (
                <Badge className="inline-flex items-center gap-1 bg-orange-100 text-orange-800">
                  Max: ${maxPriceFilter}
                  <button
                    type="button"
                    onClick={() => setMaxPriceFilter("")}
                    className="rounded p-0.5 hover:bg-orange-200"
                    aria-label="Remove max price filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <aside className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
              <Card className="space-y-5 border-slate-200/90 lg:sticky lg:top-24">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Filters</h2>
                  <p className="text-xs text-slate-500">{activeFilterCount} active</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={categoryFilter === "ALL" ? "default" : "outline"}
                      onClick={() => setCategoryFilter("ALL")}
                    >
                      All
                    </Button>
                    {categoryOptions.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        size="sm"
                        variant={categoryFilter === category ? "default" : "outline"}
                        onClick={() => setCategoryFilter(category)}
                        className="max-w-full"
                      >
                        <span className="truncate">{category}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Price Range</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Min"
                      value={minPriceFilter}
                      onChange={(e) => setMinPriceFilter(e.target.value)}
                      aria-label="Minimum price"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max"
                      value={maxPriceFilter}
                      onChange={(e) => setMaxPriceFilter(e.target.value)}
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
              </Card>
            </aside>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedMeals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden p-0">
                    <div
                      className="h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                      style={
                        meal.imageUrl
                          ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : undefined
                      }
                    />
                    <div className="space-y-3 p-4">
                      <div>
                        <h2 className="text-lg font-semibold">
                          <Link href={`/meals/${meal.id}`} className="transition-colors hover:text-emerald-700">
                            {meal.title}
                          </Link>
                        </h2>
                        <p className="text-sm text-slate-600">{meal.providerName}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.tags.length > 0 ? (
                          meal.tags.map((tag) => <Badge key={`${meal.id}-${tag}`}>{tag}</Badge>)
                        ) : (
                          <Badge>Popular</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-emerald-700">{formatMoney(Number(meal.price ?? 0))}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button className="w-full" onClick={() => handleAddToCart(meal)}>
                          <ShoppingCart className="size-4" /> Add to cart
                        </Button>
                        <Button className="w-full" variant="secondary" asChild>
                          <Link href={`/meals/${meal.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {sortedMeals.length > 0 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={sortedMeals.length}
                  pageSize={PAGE_SIZE}
                  itemLabel="meals"
                />
              )}

              {sortedMeals.length === 0 && (
                <Card>
                  <p className="text-sm text-slate-600">No meals match current filters.</p>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
