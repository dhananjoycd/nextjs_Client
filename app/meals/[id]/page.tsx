"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { addMealToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { Meal } from "@/types";

type MealReview = {
  id: string;
  rating: number;
  comment?: string;
  user?: { name?: string };
};

function resolveCategoryLabel(meal: Meal): string {
  if (!meal.category) return "";
  if (typeof meal.category === "string") return meal.category;
  return meal.category.name ?? meal.category.slug ?? "";
}

export default function MealDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
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
      const data = await apiRequest<Meal[]>("/api/v1/meals?limit=200");
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
    const currentCategory = resolveCategoryLabel(meal).toLowerCase();
    return allMeals
      .filter((item) => item.id !== meal.id)
      .filter((item) => {
        if (!currentCategory) return true;
        return resolveCategoryLabel(item).toLowerCase() === currentCategory;
      })
      .slice(0, 4);
  }, [allMeals, meal]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!meal) return <p>Loading meal details...</p>;

  const reviews = ((meal as Meal & { reviews?: MealReview[] }).reviews ?? []) as MealReview[];
  const mealTitle = meal.name ?? meal.title ?? "Meal details";
  const mealCategory = resolveCategoryLabel(meal);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / reviews.length : 0;

  function handleAddToCart(targetMeal: Meal) {
    addMealToCart(targetMeal, 1);
    toast.success("Added to cart");
    router.push("/cart");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div
          className="h-64 w-full bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 sm:h-80"
          style={
            meal.imageUrl
              ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px] lg:p-7">
          <article className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {mealCategory ? <Badge>{mealCategory}</Badge> : null}
              {reviews.length > 0 ? (
                <Badge className="bg-amber-50 text-amber-700">
                  <Star className="mr-1 size-3 fill-current" />
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </Badge>
              ) : (
                <Badge variant="outline">No reviews yet</Badge>
              )}
            </div>

            <h1 className="text-3xl leading-tight sm:text-4xl">{mealTitle}</h1>
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
              {meal.description?.trim() || "Freshly prepared meal made by trusted providers."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" className="h-11 px-5" onClick={() => handleAddToCart(meal)}>
                <ShoppingCart className="size-4" /> Add to cart
              </Button>
              {meal.provider?.id ? (
                <Button asChild variant="outline" className="h-11">
                  <Link href={`/providers/${meal.provider.id}`}>
                    <Building2 className="size-4" /> Provider Profile
                  </Link>
                </Button>
              ) : null}
            </div>
          </article>

          <aside className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-700">Price</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-800">{formatMoney(Number(meal.price ?? 0))}</p>
            <p className="mt-2 text-sm text-slate-600">Includes quality ingredients and careful preparation.</p>
          </aside>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl">Reviews</h2>
        {reviews.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">No reviews yet.</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{review.user?.name ?? "Customer"}</p>
                  <Badge className="bg-amber-50 text-amber-700">{review.rating}/5</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.comment ?? "No comment provided."}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Related Meals</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/meals">Browse all meals</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedMeals.map((item) => {
            const itemTitle = item.name ?? item.title ?? "Meal";
            return (
              <Card key={item.id} className="overflow-hidden p-0">
                <div
                  className="h-36 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                  style={
                    item.imageUrl
                      ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                />
                <div className="space-y-2 p-3">
                  <h3 className="line-clamp-1 font-medium">{itemTitle}</h3>
                  <p className="text-sm font-semibold text-emerald-700">{formatMoney(Number(item.price ?? 0))}</p>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/meals/${item.id}`}>Details</Link>
                    </Button>
                    <Button size="sm" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="size-4" /> Add
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          {relatedMeals.length === 0 && (
            <Card>
              <p className="text-sm text-slate-600">No related meals available.</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
