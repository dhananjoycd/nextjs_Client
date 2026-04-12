import Link from "next/link";
import { CategoryCard } from "@/components/home";
import { Button } from "@/components/ui";
import { config } from "@/lib/config";
import type { Category, Meal } from "@/types";

type CategoryWithCount = {
  category: Category;
  count: number;
};

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

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/categories`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const body = (await response.json()) as unknown;
    return extractList<Category>(body);
  } catch {
    return [];
  }
}

async function getMealsForCategoryStats(): Promise<Meal[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/meals?limit=200`, {
      next: { revalidate: 180 },
    });
    if (!response.ok) return [];

    const body = (await response.json()) as unknown;
    return extractList<Meal>(body);
  } catch {
    return [];
  }
}

function withMealCounts(categories: Category[], meals: Meal[]): CategoryWithCount[] {
  const mealCountByCategory = new Map<string, number>();

  for (const meal of meals) {
    const label = resolveMealCategoryLabel(meal).toLowerCase();
    if (!label) continue;
    mealCountByCategory.set(label, (mealCountByCategory.get(label) ?? 0) + 1);
  }

  return categories
    .map((category) => ({
      category,
      count: mealCountByCategory.get(category.name.toLowerCase()) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

const categoryVisualPresets = [
  { imagePosition: "center 20%", overlayToneClass: "from-emerald-900/70 via-slate-900/30 to-amber-900/60" },
  { imagePosition: "center 40%", overlayToneClass: "from-orange-900/75 via-slate-900/30 to-rose-900/60" },
  { imagePosition: "center 65%", overlayToneClass: "from-cyan-900/70 via-slate-900/30 to-emerald-900/60" },
  { imagePosition: "right 35%", overlayToneClass: "from-sky-900/70 via-slate-900/30 to-indigo-900/60" },
  { imagePosition: "left 45%", overlayToneClass: "from-amber-900/75 via-slate-900/30 to-orange-900/65" },
  { imagePosition: "center", overlayToneClass: "from-teal-900/70 via-slate-900/30 to-cyan-900/60" },
] as const;

export default async function CategoriesPage() {
  const [categories, meals] = await Promise.all([getCategories(), getMealsForCategoryStats()]);
  const categoriesWithCounts = withMealCounts(categories, meals);

  return (
    <div className="space-y-6 py-2">
      <section className="rounded-3xl border border-emerald-100 bg-linear-to-r from-emerald-100 via-amber-50 to-orange-100 p-6">
        <h1 className="text-3xl md:text-4xl">All Categories</h1>
        <p className="mt-2 text-sm text-slate-700">Explore every category and jump directly to matching meals.</p>
      </section>

      {categoriesWithCounts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categoriesWithCounts.map(({ category, count }, index) => {
            const preset = categoryVisualPresets[index % categoryVisualPresets.length];
            return (
              <CategoryCard
                key={category.id}
                name={category.name}
                href={`/meals?category=${encodeURIComponent(category.name)}`}
                mealCount={count}
                imageSrc={category.imageUrl}
                imagePosition={preset.imagePosition}
                overlayToneClass={preset.overlayToneClass}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <p>No categories available right now.</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/meals">Browse all meals</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
