"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Provider } from "@/types";

export default function ProviderPage() {
  const params = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProvider = useCallback(async () => {
    try {
      const data = await apiRequest<Provider>(`/api/v1/providers/${params.id}`);
      setProvider(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load provider");
    }
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProvider();
  }, [fetchProvider]);

  const filteredMeals = (() => {
    const meals = provider?.meals ?? provider?.user?.meals ?? [];
    if (!meals.length) return [];
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Number.MAX_SAFE_INTEGER);

    return meals.filter((meal) => {
      const mealCategory =
        typeof meal.category === "string"
          ? meal.category
          : (meal.category?.name ?? "");
      const categoryText = mealCategory.toLowerCase();
      if (category && categoryText !== category.toLowerCase()) return false;
      const price = Number(meal.price);
      if (price < min || price > max) return false;
      return true;
    });
  })();

  if (error) return <p className="text-red-600">{error}</p>;
  if (!provider) return <p>Loading provider...</p>;

  return (
    <div className="space-y-4">
      <section className="card space-y-2">
        <h1 className="text-3xl">
          {provider.restaurantName ?? provider.name ?? provider.user?.name ?? "Provider"}
        </h1>
        <p>{provider.description ?? provider.bio ?? "No profile details yet."}</p>
        {provider.cuisine && <span className="status-pill">{provider.cuisine}</span>}
      </section>

      <section className="card grid gap-3 md:grid-cols-3">
        <input className="field" placeholder="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="number" min="0" className="field" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input type="number" min="0" className="field" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </section>

      <section>
        <h2 className="mb-3 text-2xl">Menu</h2>
        <div className="grid-cards">
          {filteredMeals.map((meal) => (
            <article className="card" key={meal.id}>
              <h3 className="text-lg">{meal.name ?? meal.title ?? "Meal"}</h3>
              {meal.category && (
                <p className="text-xs text-slate-600">
                  {typeof meal.category === "string" ? meal.category : (meal.category.name ?? "Category")}
                </p>
              )}
              <p className="text-sm">${Number(meal.price).toFixed(2)}</p>
              <Link className="btn btn-outline mt-3 inline-block" href={`/meals/${meal.id}`}>
                Meal Details
              </Link>
            </article>
          ))}
          {filteredMeals.length === 0 && (
            <div className="card">
              <p className="text-sm text-slate-600">No meals match your filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
