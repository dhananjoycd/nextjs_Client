import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Badge, Card } from "@/components/ui";

type CategoryCardProps = {
  name: string;
  href: string;
};

export function CategoryCard({ name, href }: CategoryCardProps) {
  return (
    <Link href={href} aria-label={`Browse ${name} meals`} className="block h-full">
      <Card className="group relative h-full min-h-[168px] overflow-hidden border-slate-200/90 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[176px] sm:p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-amber-50/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:size-12">
              <UtensilsCrossed className="size-5" />
            </div>
            <ArrowRight className="mt-1 size-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-700" />
          </div>

          <div className="space-y-2">
            <Badge className="max-w-full my-2 truncate bg-white text-emerald-700">{name}</Badge>
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 transition-colors group-hover:text-slate-800">
              Explore curated {name.toLowerCase()} dishes from trusted providers.
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
