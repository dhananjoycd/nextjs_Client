import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Store, Truck } from "lucide-react";
import { Button, Card } from "@/components/ui";

const values = [
  {
    title: "Trusted providers",
    text: "We highlight dependable kitchens and food brands so customers can order with confidence.",
    icon: Store,
  },
  {
    title: "Faster delivery flow",
    text: "FoodHub is built to reduce friction from discovery to checkout and live order updates.",
    icon: Truck,
  },
  {
    title: "Safer operations",
    text: "Role-based dashboards and operational controls keep customer, provider, and admin workflows organized.",
    icon: ShieldCheck,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="space-y-8 py-2">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-emerald-100 via-white to-orange-100 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">About FoodHub</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">
          A modern meal marketplace built for discovery, trust, and smooth ordering.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          FoodHub brings together customers, meal providers, and admin operations inside one streamlined platform
          designed for performance, conversion, and responsive usability.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {values.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Icon className="size-5" />
              </div>
              <h2 className="text-xl">{item.title}</h2>
              <p className="text-sm text-slate-600">{item.text}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <h2 className="text-2xl">What FoodHub solves</h2>
          <div className="space-y-3">
            {[
              "Customers can compare meals, providers, and pricing from one responsive interface.",
              "Providers can publish menus and manage incoming orders with one dashboard.",
              "Admins can track users, categories, and order operations without disconnected tools.",
            ].map((item) => (
              <p key={item} className="inline-flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-2xl">Next step</h2>
          <p className="text-sm text-slate-600">
            Explore the meal catalog, check provider menus, or contact us for onboarding and delivery support.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/meals">
                Browse Meals <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Talk to FoodHub</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
