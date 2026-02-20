"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CategoryCard } from "@/components/home/category-card";
import { Button } from "@/components/ui";
import type { Category, Meal } from "@/types";

type LiveCategoriesSectionProps = {
  initialCategories: Category[];
  initialMealCounts: Record<string, number>;
};

const categoryVisualPresets = [
  { imagePosition: "center 20%", overlayToneClass: "from-emerald-900/70 via-slate-900/30 to-amber-900/60" },
  { imagePosition: "center 40%", overlayToneClass: "from-orange-900/75 via-slate-900/30 to-rose-900/60" },
  { imagePosition: "center 65%", overlayToneClass: "from-cyan-900/70 via-slate-900/30 to-emerald-900/60" },
  { imagePosition: "right 35%", overlayToneClass: "from-sky-900/70 via-slate-900/30 to-indigo-900/60" },
  { imagePosition: "left 45%", overlayToneClass: "from-amber-900/75 via-slate-900/30 to-orange-900/65" },
  { imagePosition: "center", overlayToneClass: "from-teal-900/70 via-slate-900/30 to-cyan-900/60" },
] as const;

function extractList<T>(body: unknown): T[] {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    const first = (body as { data?: unknown }).data;
    if (Array.isArray(first)) return first as T[];
    if (first && typeof first === "object" && "data" in (first as Record<string, unknown>)) {
      const second = (first as { data?: unknown }).data;
      if (Array.isArray(second)) return second as T[];
    }
  }
  return Array.isArray(body) ? (body as T[]) : [];
}

function resolveMealCategoryLabel(meal: Meal): string {
  if (!meal.category) return "";
  if (typeof meal.category === "string") return meal.category.trim();
  return String(meal.category.name ?? meal.category.slug ?? "").trim();
}

function toMealCountMap(meals: Meal[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const meal of meals) {
    const key = resolveMealCategoryLabel(meal).toLowerCase();
    if (!key) continue;
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

export function LiveCategoriesSection({ initialCategories, initialMealCounts }: LiveCategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [mealCounts, setMealCounts] = useState<Record<string, number>>(initialMealCounts);

  const refreshData = useCallback(async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
    try {
      const [categoriesResponse, mealsResponse] = await Promise.all([
        fetch(`${base}/api/v1/categories`, { cache: "no-store" }),
        fetch(`${base}/api/v1/meals?limit=200`, { cache: "no-store" }),
      ]);
      if (!categoriesResponse.ok || !mealsResponse.ok) return;

      const categoriesBody = (await categoriesResponse.json()) as unknown;
      const mealsBody = (await mealsResponse.json()) as unknown;

      const nextCategories = extractList<Category>(categoriesBody);
      const nextMeals = extractList<Meal>(mealsBody);

      setCategories(nextCategories);
      setMealCounts(toMealCountMap(nextMeals));
    } catch {
      // Keep last good snapshot if polling fails.
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshData]);

  const visibleCategories = categories
    .map((category) => ({
      category,
      count: mealCounts[category.name.toLowerCase()] ?? 0,
    }))
    .filter((item) => item.count >= 1)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="fade-up space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl md:text-3xl">Browse Categories</h2>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/meals">View all meals</Link>
          </Button>
        </div>
      </div>

      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visibleCategories.map(({ category, count }, index) => {
          const preset = categoryVisualPresets[index % categoryVisualPresets.length];
          const isTopCategory = index === 0;
          const responsiveCardSize = isTopCategory ? "sm:col-span-2 lg:col-span-2" : "";
          return (
            <CategoryCard
              key={category.id}
              name={category.name}
              href={`/meals?category=${encodeURIComponent(category.name)}`}
              mealCount={count}
              imageSrc={category.imageUrl}
              imagePosition={preset.imagePosition}
              overlayToneClass={preset.overlayToneClass}
              className={responsiveCardSize}
            />
          );
        })}

        {visibleCategories.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <p>No categories with meals yet. Categories with at least 1 meal will appear here automatically.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/meals">Browse all meals</Link>
            </Button>
          </div>
        )}
      </div>

      <Button asChild variant="outline" className="w-full sm:hidden">
        <Link href="/meals">View all meals</Link>
      </Button>
    </section>
  );
}
