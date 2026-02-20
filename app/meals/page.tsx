"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button, Card, Input, Skeleton } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { addMealToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { Meal } from "@/types";

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

function mealDietaryTags(meal: Meal): string[] {
  const unique = new Set(
    [
      ...toTagList(meal.dietary),
      ...toTagList(meal.dietaryPreferences),
      ...toTagList(meal.tags),
    ]
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return Array.from(unique);
}

export default function MealsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [dietaryFilter, setDietaryFilter] = useState("ALL");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");

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

  const preparedMeals = useMemo(
    () =>
      meals.map((meal) => ({
        ...meal,
        title: meal.name ?? meal.title ?? "Meal",
        tags: mealTags(meal),
        categoryLabel: mealCategory(meal),
        dietaryTags: mealDietaryTags(meal),
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

  const dietaryOptions = useMemo(() => {
    const values = new Set<string>();
    for (const meal of preparedMeals) {
      for (const tag of meal.dietaryTags) values.add(tag);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [preparedMeals]);

  const filteredMeals = useMemo(() => {
    const minPrice = minPriceFilter.trim() ? Number(minPriceFilter) : undefined;
    const maxPrice = maxPriceFilter.trim() ? Number(maxPriceFilter) : undefined;

    return preparedMeals.filter((meal) => {
      if (categoryFilter !== "ALL" && meal.categoryLabel !== categoryFilter) return false;
      if (
        dietaryFilter !== "ALL" &&
        !meal.dietaryTags.some((tag) => tag.toLowerCase() === dietaryFilter.toLowerCase())
      ) {
        return false;
      }

      const price = Number(meal.price ?? 0);
      if (minPrice !== undefined && Number.isFinite(minPrice) && price < minPrice) return false;
      if (maxPrice !== undefined && Number.isFinite(maxPrice) && price > maxPrice) return false;

      return true;
    });
  }, [categoryFilter, dietaryFilter, maxPriceFilter, minPriceFilter, preparedMeals]);

  function clearFilters() {
    setCategoryFilter("ALL");
    setDietaryFilter("ALL");
    setMinPriceFilter("");
    setMaxPriceFilter("");
  }

  function handleAddToCart(meal: Meal) {
    if (!user) {
      toast.error("Please login as customer to order meals");
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customer accounts can place orders");
      return;
    }

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
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Filter Meals</h2>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <select className="field" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="ALL">All cuisines/categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select className="field" value={dietaryFilter} onChange={(e) => setDietaryFilter(e.target.value)}>
                <option value="ALL">All dietary</option>
                {dietaryOptions.map((dietary) => (
                  <option key={dietary} value={dietary}>
                    {dietary}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min price"
                value={minPriceFilter}
                onChange={(e) => setMinPriceFilter(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Max price"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
              />
            </div>
            <p className="text-sm text-slate-600">{filteredMeals.length} meals found</p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMeals.map((meal) => (
            <Card key={meal.id} className="overflow-hidden p-0">
              <div
                className="h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                style={meal.imageUrl ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              />
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-lg font-semibold">{meal.title}</h2>
                  <p className="text-sm text-slate-600">{meal.providerName}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {meal.tags.length > 0 ? (
                    meal.tags.map((tag) => (
                      <Badge key={`${meal.id}-${tag}`}>
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Badge>Popular</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-emerald-700">{formatMoney(Number(meal.price ?? 0))}</p>
                </div>
                <Button className="w-full" onClick={() => handleAddToCart(meal)}>
                  <ShoppingCart className="size-4" /> Add to cart
                </Button>
              </div>
            </Card>
          ))}
          </div>
          {filteredMeals.length === 0 && (
            <Card>
              <p className="text-sm text-slate-600">No meals match current filters.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
