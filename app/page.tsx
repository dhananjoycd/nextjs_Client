import Link from "next/link";
import { ArrowRight, ChefHat, Clock3, ShieldCheck } from "lucide-react";
import { CategoryCard, MealCard, ProviderCard } from "@/components/home";
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

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/categories`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as unknown;
    return extractList<Category>(body).slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredMeals, topProviders, categories] = await Promise.all([
    getFeaturedMeals(),
    getTopProviders(),
    getCategories(),
  ]);

  return (
    <div className="space-y-14 py-3">
      <section className="fade-up grid items-center gap-8 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm md:grid-cols-2 md:p-10">
        <article className="space-y-5">
          <Badge className="bg-emerald-100 text-emerald-700">Premium meal ordering platform</Badge>
          <h1 className="text-4xl leading-tight md:text-5xl">Order Fresh Meals From Trusted Providers</h1>
          <p className="max-w-xl text-slate-600">
            FoodHub delivers a modern ordering experience with curated menus, quick checkout, and realtime order
            tracking.
          </p>
          <form action="/meals" className="flex w-full max-w-md gap-2">
            <Input name="search" placeholder="Search meals or providers..." aria-label="Search meals or providers" />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/meals">
                Browse Meals <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/providers">Explore Providers</Link>
            </Button>
          </div>
        </article>
        <div className="hero-blob relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-200/80 via-amber-100 to-orange-200/90 p-8 shadow-xl">
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/50 blur-xl" />
          <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-emerald-400/25 blur-2xl" />
          <div className="relative space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-700">Fast - Fresh - Reliable</p>
            <p className="text-2xl font-semibold text-slate-800">From kitchen to doorstep in minutes</p>
            <div className="grid gap-2 text-sm text-slate-700">
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" /> Verified providers
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-emerald-600" /> Live order updates
              </p>
              <p className="inline-flex items-center gap-2">
                <ChefHat className="size-4 text-emerald-600" /> Freshly prepared meals
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="fade-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Browse Categories</h2>
          <Link
            href="/meals"
            className="inline-flex h-10 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              href={`/meals?category=${encodeURIComponent(category.name)}`}
            />
          ))}
          {categories.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p>Categories are not available right now.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/meals">Browse all meals</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="fade-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Featured Meals</h2>
          <Link
            href="/meals"
            className="inline-flex h-10 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            Browse all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
          {featuredMeals.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p>Featured meals are not available right now.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/meals">Browse all meals</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="fade-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Top Providers</h2>
          <Link
            href="/providers"
            className="inline-flex h-10 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            Explore providers
            <ArrowRight className="size-4" />
          </Link>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <p>Providers are not available right now.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/providers">Explore providers</Link>
              </Button>
            </div>
          )}
        </div>
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
