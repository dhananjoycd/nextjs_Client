"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, MessageSquareQuote, Sparkles, Star } from "lucide-react";
import { Badge, Card, Skeleton } from "@/components/ui";
import { aiService } from "@/services";
import type { AiMealReviewSummary } from "@/types";

type Props = {
  mealId: string;
  mealTitle: string;
};

function sentimentLabel(sentiment: "positive" | "negative") {
  return sentiment === "positive" ? "Positive" : "Concern";
}

export function MealReviewSummary({ mealId, mealTitle }: Props) {
  const [summary, setSummary] = useState<AiMealReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const result = await aiService.mealReviewSummary({ mealId });
        if (!active) return;
        setSummary(result);
      } catch {
        if (!active) return;
        setSummary(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [mealId]);

  if (loading) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-4 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="space-y-2 border-dashed">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          <BrainCircuit className="mr-1 inline size-3.5" /> AI Review Summary
        </p>
        <p className="text-sm text-slate-600">
          We could not generate a review summary for {mealTitle} right now.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <BrainCircuit className="size-3.5" /> AI Review Summary
          </p>
          <h3 className="text-2xl">What customers are saying</h3>
          <p className="max-w-2xl text-sm text-slate-600">{summary.summary}</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">
          <Sparkles className="mr-1 size-3.5" /> {summary.recommendation}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Average rating</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.averageRating.toFixed(1)}/5</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total reviews</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.reviewCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Positive</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{summary.positiveCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Neutral</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{summary.neutralCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Negative</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">{summary.negativeCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Star className="size-4" /> Highlights
          </p>
          {summary.highlights.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summary.highlights.map((item) => (
                <Badge key={item} className="bg-emerald-100 text-emerald-700">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No strong highlights were detected yet.</p>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
            <MessageSquareQuote className="size-4" /> Concerns
          </p>
          {summary.concerns.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summary.concerns.map((item) => (
                <Badge key={item} className="bg-rose-100 text-rose-700">
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No major concerns surfaced from the reviews.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {summary.themes.map((theme) => (
          <Badge
            key={`${theme.label}-${theme.sentiment}`}
            className={theme.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}
          >
            {theme.label} · {sentimentLabel(theme.sentiment)} · {theme.mentions}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
