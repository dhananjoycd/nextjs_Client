"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import { cartService } from "@/services";
import type { Meal } from "@/types";

type MealReview = {
  id: string;
  rating: number;
  comment?: string;
  user?: { name?: string };
};

export default function MealDetailsPage() {
  const { token, user } = useAuth();
  const params = useParams<{ id: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMeal = useCallback(async () => {
    try {
      setError("");
      const data = await apiRequest<Meal>(`/api/v1/meals/${params.id}`);
      setMeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal");
    }
  }, [params.id]);

  const fetchRelatedPool = useCallback(async () => {
    try {
      const data = await apiRequest<Meal[]>("/api/v1/meals");
      setAllMeals(Array.isArray(data) ? data : []);
    } catch {
      setAllMeals([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMeal();
    void fetchRelatedPool();
  }, [fetchMeal, fetchRelatedPool]);

  const relatedMeals = useMemo(() => {
    if (!meal) return [];
    return allMeals
      .filter((item) => item.id !== meal.id)
      .filter((item) => (meal.category ? item.category === meal.category : true))
      .slice(0, 4);
  }, [allMeals, meal]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!meal) return <p>Loading meal details...</p>;

  const reviews = ((meal as Meal & { reviews?: MealReview[] }).reviews ?? []) as MealReview[];
  const mealCategory =
    typeof meal.category === "string"
      ? meal.category
      : (meal.category?.name ?? "");

  return (
    <div className="space-y-4">
      <section className="card space-y-4">
        <h1 className="text-3xl">{meal.name ?? meal.title ?? "Meal Details"}</h1>
        <p>{meal.description ?? "No description provided."}</p>
        <div className="flex flex-wrap gap-2">
          <span className="status-pill">${Number(meal.price).toFixed(2)}</span>
          {mealCategory && <span className="status-pill">{mealCategory}</span>}
          {meal.provider?.name && (
            <Link className="status-pill" href={`/providers/${meal.provider.id}`}>
              {meal.provider.name}
            </Link>
          )}
        </div>
        <button
          className="btn btn-primary w-fit"
          onClick={async () => {
            try {
              setMessage("");
              if (!token) {
                setMessage("Please login as customer to order meals.");
                toast.error("Please login as customer to order meals");
                return;
              }
              if (user?.role !== "CUSTOMER") {
                setMessage("Only customer accounts can place orders.");
                toast.error("Only customer accounts can place orders");
                return;
              }

              await cartService.add(token, { mealId: meal.id, quantity: 1 });
              setMessage("Added to cart.");
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Failed to add to cart.");
            }
          }}
        >
          Add to Cart
        </button>
        {message && <p className="text-teal-700">{message}</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="text-2xl">Reviews</h2>
        {reviews.length === 0 && <p className="text-sm text-slate-600">No reviews yet.</p>}
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-[var(--border)] p-3">
            <p className="text-sm font-semibold">{review.user?.name ?? "Customer"}</p>
            <p className="text-sm">Rating: {review.rating}/5</p>
            <p className="text-sm text-slate-700">{review.comment ?? "No comment"}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl">Related Meals</h2>
        <div className="grid-cards">
          {relatedMeals.map((item) => (
            <article key={item.id} className="card">
              <h3 className="text-lg">{item.name ?? item.title ?? "Meal"}</h3>
              <p className="text-sm">${Number(item.price).toFixed(2)}</p>
              <Link className="btn btn-outline mt-2 inline-block" href={`/meals/${item.id}`}>
                View
              </Link>
            </article>
          ))}
          {relatedMeals.length === 0 && (
            <div className="card">
              <p className="text-sm text-slate-600">No related meals available.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
