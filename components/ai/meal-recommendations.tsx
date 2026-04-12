"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { addMealToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { aiService } from "@/services";
import type { AiAssistantMeta, AiMealRecommendation, Meal } from "@/types";

type Props = {
  title: string;
  description: string;
  mealId?: string;
  limit?: number;
  excludeIds?: string[];
  emptyText?: string;
};

function signalLabel(signal: AiMealRecommendation["signal"]) {
  if (signal === "personal_history") return "For You";
  if (signal === "similar_meal") return "Similar Pick";
  if (signal === "budget_match") return "Budget Match";
  return "Popular";
}

export function MealRecommendations({
  title,
  description,
  mealId,
  limit = 4,
  excludeIds,
  emptyText = "No recommendations available right now.",
}: Props) {
  const [items, setItems] = useState<AiMealRecommendation[]>([]);
  const [assistant, setAssistant] = useState<AiAssistantMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const result = await aiService.mealRecommendations({ mealId, limit, excludeIds });
        if (!active) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
        setAssistant(result?.assistant ?? null);
      } catch {
        if (!active) return;
        setItems([]);
        setAssistant(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [excludeIds, limit, mealId]);

  function handleAdd(item: AiMealRecommendation) {
    addMealToCart(
      {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        dietary: item.dietary,
        providerId: item.provider.id,
        provider: item.provider,
        category: item.category,
      } as Meal,
      1,
    );
    toast.success("Added to cart");
  }

  return (
    <section className="space-y-4">
      {assistant ? (
        <p className="text-xs text-slate-500">
          {assistant.source === "gemini"
            ? `Rayna AI is using Gemini (${assistant.model}) for recommendation reranking.`
            : "Rayna AI is using local fallback logic for recommendations right now."}
        </p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
         AI Recommendations
          </p>
          <h2 className="text-2xl">{title}</h2>
          <p className="max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <Badge className={assistant?.source === "gemini" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
          <Sparkles className="mr-1 size-3.5" /> {assistant?.source === "gemini" ? `${assistant.label} (Gemini)` : `${assistant?.label ?? "Rayna LV1.1"} (Local)`}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="space-y-3 p-0">
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">{emptyText}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div
                className="h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                style={
                  item.imageUrl
                    ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              />
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-700">{signalLabel(item.signal)}</Badge>
                  <Badge className="bg-amber-50 text-amber-700">{item.rating.toFixed(1)} rating</Badge>
                </div>
                <div>
                  <h3 className="line-clamp-1 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.provider.name ?? "Trusted provider"}</p>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{item.reason}</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-emerald-700">{formatMoney(item.price)}</p>
                  <p className="text-xs text-slate-500">{item.reviewCount} reviews</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => handleAdd(item)}>
                    <ShoppingCart className="size-4" /> Add
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/meals/${item.id}`}>
                      Details <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
