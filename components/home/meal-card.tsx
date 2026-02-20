"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card } from "@/components/ui";
import { addMealToCart } from "@/lib/cart";
import type { Meal } from "@/types";

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
  const router = useRouter();
  const title = meal.name ?? meal.title ?? "Untitled meal";
  const rating = meal.rating ?? 4.5;
  const imageStyle = meal.imageUrl
    ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  function handleAddToCart() {
    addMealToCart({ ...(meal as Meal), providerId: meal.provider?.id }, 1);
    toast.success("Added to cart");
    router.push("/cart");
  }

  return (
    <Card className="group overflow-hidden border-slate-200 bg-white/95 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="h-44 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
        role="img"
        aria-label={title}
        style={imageStyle}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg">
            <Link href={`/meals/${meal.id}`} className="transition-colors hover:text-emerald-700">
              {title}
            </Link>
          </h3>
          <Badge className="bg-amber-50 text-amber-700">
            <Star className="mr-1 size-3 fill-current" />
            {rating.toFixed(1)}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{meal.provider?.name ?? "Trusted provider"}</p>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-emerald-700">${Number(meal.price ?? 0).toFixed(2)}</p>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              aria-label={`Add ${title} to cart`}
              onClick={handleAddToCart}
              className="cursor-pointer"
            >
              <ShoppingCart className="size-4" />
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/meals/${meal.id}`}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
