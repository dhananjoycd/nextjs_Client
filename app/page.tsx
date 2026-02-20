import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles, Star, Store, Truck } from "lucide-react";
import { MealCard, ProviderCard } from "@/components/home";
import { LiveCategoriesSection } from "@/components/home/live-categories-section";
import { Badge, Button, Input } from "@/components/ui";
import { config } from "@/lib/config";
import type { Category, Meal, Provider } from "@/types";

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

async function getFeaturedMeals(): Promise<Meal[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/meals?limit=6`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as unknown;
    return extractList<Meal>(body).slice(0, 6);
  } catch {
    return [];
  }
}

async function getTopProviders(): Promise<Provider[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/providers`, {
      next: { revalidate: 180 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as unknown;
    return extractList<Provider>(body).slice(0, 4);
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

function resolveMealCategoryLabel(meal: Meal): string {
  if (!meal.category) return "";
  if (typeof meal.category === "string") return meal.category.trim();
  return String(meal.category.name ?? meal.category.slug ?? "").trim();
}

const trustItems = [
  { label: "Loved by users", value: "4.8/5", icon: Star },
  { label: "Quick delivery", value: "25 min avg", icon: Truck },
  { label: "Safe checkout", value: "100% secure", icon: ShieldCheck },
] as const;

export default async function HomePage() {
  const [featuredMeals, topProviders, categories, allMealsForStats] = await Promise.all([
    getFeaturedMeals(),
    getTopProviders(),
    getCategories(),
    getMealsForCategoryStats(),
  ]);
  const mealCountByCategory = new Map<string, number>();
  for (const meal of allMealsForStats) {
    const label = resolveMealCategoryLabel(meal).toLowerCase();
    if (!label) continue;
    mealCountByCategory.set(label, (mealCountByCategory.get(label) ?? 0) + 1);
  }
  const initialCategoryMealCounts = Object.fromEntries(mealCountByCategory);
  const heroPreviewMeals =
    featuredMeals.length > 0
      ? featuredMeals.slice(0, 3).map((meal) => ({
          id: meal.id,
          title: meal.name ?? meal.title ?? "Meal",
          price: Number(meal.price ?? 0),
          provider: meal.provider?.name ?? "Trusted provider",
          imageUrl: meal.imageUrl,
        }))
      : [
          { id: "fallback-1", title: "Chicken Biryani", price: 220, provider: "FoodHub Kitchen", imageUrl: undefined },
          { id: "fallback-2", title: "Beef Pasta", price: 260, provider: "Urban Meals", imageUrl: undefined },
          { id: "fallback-3", title: "Thai Soup Bowl", price: 180, provider: "Taste Corner", imageUrl: undefined },
        ];

  return (
    <div className="space-y-14 py-3">
      <section className="fade-up relative overflow-hidden rounded-[2rem] border border-slate-200/80 p-5 shadow-sm sm:p-7 lg:p-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-banner.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-emerald-50/85 to-amber-50/80" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-60 w-60 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-16 h-24 w-24 rounded-full border border-white/70 bg-white/30 backdrop-blur-sm" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="space-y-6">
            <Badge className="w-fit bg-emerald-100 text-emerald-700">
              <Sparkles className="mr-1 size-3.5" />
              FoodHub Marketplace
            </Badge>

            <div className="space-y-3">
              <h1 className="text-3xl leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Hungry? Find your
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> next favorite meal </span>
                in minutes
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Discover premium homemade and restaurant meals, compare trusted providers, and checkout fast with a
                smooth e-commerce experience.
              </p>
            </div>

            <form action="/meals" className="w-full max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm sm:flex-row">
                <Input
                  name="search"
                  placeholder="Search meals, providers, cuisines..."
                  aria-label="Search meals or providers"
                  className="h-11 border-none bg-transparent shadow-none focus-visible:ring-0 sm:flex-1"
                />
                <Button type="submit" className="h-11 rounded-xl px-5">
                  <Search className="size-4" />
                  Find Meals
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="h-11 sm:h-10">
                <Link href="/meals">
                  Browse Meals <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-slate-300 bg-white/80 sm:h-10">
                <Link href="/providers">
                  <Store className="size-4" /> Explore Providers
                </Link>
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2">
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <Icon className="size-4 text-emerald-600" />
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-600">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="relative">
            <div className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-md sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Trending Today</p>
                <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>
              </div>

              <div className="space-y-3">
                {heroPreviewMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/90 p-2.5 shadow-sm"
                  >
                    <div
                      className="h-14 w-14 shrink-0 rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                      style={
                        meal.imageUrl
                          ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : undefined
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{meal.title}</p>
                      <p className="line-clamp-1 text-xs text-slate-500">{meal.provider}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">${meal.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-lg backdrop-blur sm:-left-5">
              <p className="text-xs text-slate-500">Orders today</p>
              <p className="text-lg font-semibold text-slate-900">1,280+</p>
            </div>
            <div className="absolute -right-3 -top-3 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-lg backdrop-blur">
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="size-3.5" /> Secure checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      <LiveCategoriesSection initialCategories={categories} initialMealCounts={initialCategoryMealCounts} />

      <section className="fade-up space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl md:text-3xl">Featured Meals</h2>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/meals">Browse all meals</Link>
            </Button>
          </div>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
          {featuredMeals.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p>Featured meals are not available right now.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/meals">Browse all meals</Link>
              </Button>
            </div>
          )}
        </div>
        <Button asChild variant="outline" className="w-full sm:hidden">
          <Link href="/meals">Browse all meals</Link>
        </Button>
      </section>

      <section className="fade-up space-y-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl md:text-3xl">Top Providers</h2>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/providers">Explore providers</Link>
            </Button>
          </div>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topProviders.map((provider) => (
            <ProviderCard
              key={provider.user?.id ?? provider.id}
              provider={{
                id: provider.user?.id ?? provider.id,
                name: provider.restaurantName ?? provider.name ?? provider.user?.name,
                location: provider.address ?? "Dhaka, Bangladesh",
                totalMeals: provider.user?.meals?.length ?? provider.meals?.length ?? 0,
              }}
            />
          ))}
          {topProviders.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p>Providers are not available right now.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/providers">Explore providers</Link>
              </Button>
            </div>
          )}
        </div>
        <Button asChild variant="outline" className="w-full sm:hidden">
          <Link href="/providers">Explore providers</Link>
        </Button>
      </section>

      <section className="fade-up space-y-4">
        <h2 className="text-2xl md:text-3xl">How It Works</h2>
        <div className="stagger grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Discover Meals",
              text: "Search and filter meals by category, provider, and budget in seconds.",
            },
            {
              title: "Checkout Fast",
              text: "Use streamlined checkout and confirm orders with instant feedback.",
            },
            {
              title: "Track Delivery",
              text: "Watch your order progress from pending to delivered with status timeline.",
            },
          ].map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {index + 1}
              </p>
              <h3 className="text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-100 via-amber-50 to-orange-100 p-7 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl">Ready to order your next meal?</h2>
            <p className="text-sm text-slate-700">Join thousands of users already ordering with FoodHub.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/meals">Start Ordering</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
