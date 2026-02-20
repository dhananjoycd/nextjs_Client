import Link from "next/link";
import { ArrowRight, MapPin, Utensils } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

export interface HomeProvider {
  id: string;
  name?: string;
  location?: string;
  totalMeals?: number;
}

type ProviderCardProps = {
  provider: HomeProvider;
};

export function ProviderCard({ provider }: ProviderCardProps) {
  const displayName = provider.name ?? "Provider";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Card className="group h-full space-y-4 border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-base font-semibold text-emerald-700 sm:size-12">
            {initial}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{displayName}</h3>
            <p className="inline-flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="size-4 shrink-0 text-slate-400" />
              <span className="truncate">{provider.location ?? "Dhaka, Bangladesh"}</span>
            </p>
          </div>
        </div>

        <Badge className="shrink-0 bg-sky-50 text-sky-700">{provider.totalMeals ?? 0} meals</Badge>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <Utensils className="size-4" />
          Menu items
        </span>
        <span className="font-semibold text-emerald-800">{provider.totalMeals ?? 0}</span>
      </div>

      <Button asChild variant="outline" className="h-11 w-full justify-around rounded-xl px-4">
        <Link href={`/providers/${provider.id}`}>
          Visit Profile
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  );
}
