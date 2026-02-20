import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageToken = number | "...";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  className?: string;
};

function buildPageTokens(current: number, total: number): PageToken[] {
  if (total <= 8) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const selected = new Set<number>([
    1,
    2,
    3,
    total - 2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);

  const pages = Array.from(selected)
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  const tokens: PageToken[] = [];
  for (let index = 0; index < pages.length; index += 1) {
    const value = pages[index];
    const prev = pages[index - 1];
    if (index > 0 && prev !== undefined && value - prev > 1) {
      tokens.push("...");
    }
    tokens.push(value);
  }
  return tokens;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  itemLabel = "items",
  className,
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);
  const tokens = buildPageTokens(safePage, safeTotal);
  const hasResultContext = typeof totalItems === "number";
  const rangeStart = hasResultContext && totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = hasResultContext ? Math.min(safePage * pageSize, totalItems ?? 0) : 0;

  return (
    <nav className={cn("flex flex-wrap items-center justify-end gap-2", className)} aria-label="Pagination">
      {hasResultContext && (
        <span className="mr-auto hidden text-sm text-slate-600 md:inline">
          {totalItems === 0
            ? `Showing 0 of 0 ${itemLabel}`
            : `Showing ${rangeStart}-${rangeEnd} of ${totalItems} ${itemLabel}`}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-10 px-3"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="size-4" />
        Prev
      </Button>

      <span className="text-sm text-slate-600 sm:hidden" aria-live="polite">
        {safePage} / {safeTotal}
      </span>

      <div className="hidden items-center gap-1 sm:flex" aria-label="Page numbers">
        {tokens.map((token, index) =>
          token === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-500">
              ...
            </span>
          ) : (
            <Button
              key={`page-${token}`}
              size="sm"
              className="h-10 min-w-10 px-3"
              variant={safePage === token ? "default" : "outline"}
              onClick={() => onPageChange(token)}
              aria-label={`Go to page ${token}`}
              aria-current={safePage === token ? "page" : undefined}
            >
              {token}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-10 px-3"
        disabled={safePage >= safeTotal}
        onClick={() => onPageChange(safePage + 1)}
        aria-label="Go to next page"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
