import Link from "next/link";
import { CategoryCard, MealCard, ProviderCard } from "@/components/home";
import { Badge, Button, Input } from "@/components/ui";
import { config } from "@/lib/config";
import type { Meal, Provider } from "@/types";

const categories = ["Bangla", "Fast Food", "Chinese", "Healthy", "Desserts", "Drinks"];

async function getFeaturedMeals(): Promise<Meal[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/meals?featured=true`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as unknown;
    if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
      return ((body as { data?: Meal[] }).data ?? []).slice(0, 6);
    }
    return (Array.isArray(body) ? body : []).slice(0, 6) as Meal[];
  } catch {
    return [];
  }
}

async function getTopProviders(): Promise<Provider[]> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/providers`, {
      next: { revalidate: 180 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as unknown;
    const providers =
      body && typeof body === "object" && "data" in (body as Record<string, unknown>)
        ? ((body as { data?: Provider[] }).data ?? [])
        : ((Array.isArray(body) ? body : []) as Provider[]);
    return providers.slice(0, 4);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredMeals, topProviders] = await Promise.all([getFeaturedMeals(), getTopProviders()]);

  return (
    <div className="space-y-12 py-4">
      <section className="grid items-center gap-6 md:grid-cols-2">
        <article className="space-y-5">
          <Badge className="bg-emerald-100 text-emerald-800">Trusted local providers</Badge>
          <h1 className="text-4xl leading-tight md:text-5xl">Discover &amp; Order Delicious Meals</h1>
          <p className="max-w-xl text-slate-700">
            Browse meals from verified kitchens, place your order in seconds, and track delivery
            from preparation to doorstep.
          </p>
          <form action="/meals" className="flex w-full max-w-md gap-2">
            <Input name="search" placeholder="Search meals or providers..." aria-label="Search meals or providers" />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/meals">Browse Meals</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">Become a Provider</Link>
            </Button>
          </div>
        </article>
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-200/70 via-amber-100 to-orange-200/80 p-8 shadow-xl">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/50 blur-2xl" />
          <div className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-emerald-400/25 blur-3xl" />
          <div className="relative space-y-3 text-slate-800">
            <p className="text-sm uppercase tracking-[0.2em]">FoodHub</p>
            <p className="text-2xl font-semibold">Fresh picks delivered every day</p>
            <p className="text-sm">
              Healthy bowls, street favorites, premium desserts, and more from the best providers.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Categories</h2>
          <Link href="/meals" className="text-sm font-medium text-emerald-700">
            View all meals
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category} name={category} href={`/meals?category=${encodeURIComponent(category)}`} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Featured Meals</h2>
          <Link href="/meals" className="text-sm font-medium text-emerald-700">
            Browse all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
          {featuredMeals.length === 0 && (
            <p className="text-sm text-slate-600">Featured meals are not available right now.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl">Top Providers</h2>
          <Link href="/providers" className="text-sm font-medium text-emerald-700">
            Explore providers
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={{
                id: provider.id,
                name: provider.name ?? provider.user?.name,
                location: (provider as Provider & { location?: string }).location,
                totalMeals: provider.meals?.length ?? (provider as Provider & { totalMeals?: number }).totalMeals,
              }}
            />
          ))}
          {topProviders.length === 0 && (
            <p className="text-sm text-slate-600">Providers are loading. Please check again shortly.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl">How It Works</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-2xl">1</p>
            <h3 className="text-xl">Browse Meals</h3>
            <p className="text-sm text-slate-600">Filter by cuisine, price, and provider to find your meal.</p>
          </article>
          <article className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-2xl">2</p>
            <h3 className="text-xl">Place Order</h3>
            <p className="text-sm text-slate-600">Add to cart, checkout with address, and confirm COD order.</p>
          </article>
          <article className="card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-2xl">3</p>
            <h3 className="text-xl">Track Delivery</h3>
            <p className="text-sm text-slate-600">Follow each status from PLACED to DELIVERED in your orders.</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-100 via-amber-50 to-orange-100 p-6 shadow-lg">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl">Hungry right now?</h2>
            <p className="text-sm text-slate-700">Start ordering from your favorite providers in a few clicks.</p>
          </div>
          <Button asChild>
            <Link href="/meals">Start Ordering Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

