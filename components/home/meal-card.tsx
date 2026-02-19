import Link from "next/link";
import { Star } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

export interface HomeMeal {
  id: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  price: number;
  rating?: number;
  provider?: {
    id: string;
    name?: string;
  };
}

type MealCardProps = {
  meal: HomeMeal;
};

export function MealCard({ meal }: MealCardProps) {
  const title = meal.name ?? meal.title ?? "Untitled meal";
  const rating = meal.rating ?? 4.5;

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white/95 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
        role="img"
        aria-label={title}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg">{title}</h3>
          <Badge className="bg-amber-50 text-amber-700">
            <Star className="mr-1 size-3 fill-current" />
            {rating.toFixed(1)}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{meal.provider?.name ?? "Trusted provider"}</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-emerald-700">${Number(meal.price ?? 0).toFixed(2)}</p>
          <Button variant="secondary" asChild>
            <Link href={`/meals/${meal.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
