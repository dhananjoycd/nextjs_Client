import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { Badge, Card } from "@/components/ui";

type CategoryCardProps = {
  name: string;
  href: string;
};

export function CategoryCard({ name, href }: CategoryCardProps) {
  return (
    <Link href={href} aria-label={`Browse ${name} meals`}>
      <Card className="group relative h-full overflow-hidden border-slate-200 bg-white/95 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-transparent to-amber-50/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative space-y-3">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <UtensilsCrossed className="size-5" />
          </div>
          <Badge className="bg-white text-emerald-700">{name}</Badge>
          <p className="text-sm text-slate-600 group-hover:text-slate-800">
            Explore curated {name.toLowerCase()} dishes.
          </p>
        </div>
      </Card>
    </Link>
  );
}
