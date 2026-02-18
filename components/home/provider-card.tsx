import Link from "next/link";
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
  return (
    <Card className="space-y-3 border-transparent bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg">{provider.name ?? "Provider"}</h3>
        <Badge className="bg-sky-50 text-sky-700">{provider.totalMeals ?? 0} meals</Badge>
      </div>
      <p className="text-sm text-slate-600">{provider.location ?? "Dhaka, Bangladesh"}</p>
      <Button asChild variant="outline">
        <Link href={`/providers/${provider.id}`}>Visit Profile</Link>
      </Button>
    </Card>
  );
}

