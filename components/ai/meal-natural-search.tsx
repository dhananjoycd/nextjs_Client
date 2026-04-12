"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrainCircuit, Search, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card, Input, Skeleton } from "@/components/ui";
import { addMealToCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { aiService } from "@/services";
import type { AiMealNaturalSearchResponse, AiMealSearchResult, Meal } from "@/types";

type Props = {
  title: string;
  description: string;
  placeholder?: string;
  limit?: number;
  initialQuery?: string;
  suggestions?: string[];
};

const DEFAULT_SUGGESTIONS = [
  "healthy low price meals",
  "spicy chicken under 300",
  "high protein dinner",
  "premium seafood",
];

function signalLabel(signal: AiMealSearchResult["signal"]) {
  if (signal === "personalized_match") return "For You";
  if (signal === "budget_match") return "Budget";
  if (signal === "premium_match") return "Premium";
  return "Text Match";
}

export function MealNaturalSearch({
  title,
  description,
  placeholder = "Try: spicy healthy meals under 300",
  limit = 6,
  initialQuery = "",
  suggestions = DEFAULT_SUGGESTIONS,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiMealNaturalSearchResponse | AiMealSearchResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const interpreted =
    response && !Array.isArray(response) ? response.interpreted : undefined;
  const results =
    response && Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

  const activeIntents = useMemo(() => {
    if (!interpreted) return [] as string[];
    const intents = interpreted.intents;
    const labels: string[] = [];
    if (intents.budget) labels.push("budget");
    if (intents.premium) labels.push("premium");
    if (intents.healthy) labels.push("healthy");
    if (intents.spicy) labels.push("spicy");
    if (intents.sweet) labels.push("sweet");
    if (intents.proteinRich) labels.push("protein");
    return labels;
  }, [interpreted]);

  async function runSearch(phrase: string) {
    const clean = phrase.trim();
    if (!clean) {
      toast.error("Please enter a search phrase");
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.naturalLanguageMealSearch({ q: clean, limit });
      setResponse(result);
      setHasSearched(true);
    } catch {
      setResponse(null);
      setHasSearched(true);
      toast.error("AI search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(item: AiMealSearchResult) {
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
    <section className="space-y-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <BrainCircuit className="size-3.5" /> AI Natural Language Search
          </p>
          <h2 className="text-2xl">{title}</h2>
          <p className="max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">
          <Sparkles className="mr-1 size-3.5" /> Intent aware
        </Badge>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch(query);
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="AI natural language meal search"
          className="h-11 bg-white"
        />
        <Button type="submit" className="h-11 sm:px-5" disabled={loading}>
          <Search className="size-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((text) => (
          <Button
            key={text}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery(text);
              void runSearch(text);
            }}
            className="rounded-full bg-white"
          >
            {text}
          </Button>
        ))}
      </div>

      {response && interpreted ? (
        <div className="flex flex-wrap gap-2">
          {interpreted.terms.map((term) => (
            <Badge key={term} className="bg-slate-100 text-slate-700">
              {term}
            </Badge>
          ))}
          {activeIntents.map((intent) => (
            <Badge key={intent} className="bg-amber-50 text-amber-700">
              {intent}
            </Badge>
          ))}
          {interpreted.maxPrice !== null ? (
            <Badge className="bg-emerald-100 text-emerald-700">max {interpreted.maxPrice}</Badge>
          ) : null}
          {interpreted.minPrice !== null ? (
            <Badge className="bg-emerald-100 text-emerald-700">min {interpreted.minPrice}</Badge>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="space-y-3 p-0">
              <Skeleton className="h-36 w-full rounded-t-xl rounded-b-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No meals matched this natural language search.</p>
        </Card>
      ) : results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div
                className="h-36 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
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
                  <p className="line-clamp-1 text-sm text-slate-600">{item.provider.name ?? "Trusted provider"}</p>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{item.reason}</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-emerald-700">{formatMoney(item.price)}</p>
                  <p className="text-xs text-slate-500">Score {item.score.toFixed(1)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => handleAdd(item)}>
                    <ShoppingCart className="size-4" /> Add
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/meals/${item.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
