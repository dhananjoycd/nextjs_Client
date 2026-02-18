import Link from "next/link";
import { Badge, Card } from "@/components/ui";

type CategoryCardProps = {
  name: string;
  href: string;
};

export function CategoryCard({ name, href }: CategoryCardProps) {
  return (
    <Link href={href} aria-label={`Browse ${name} meals`}>
      <Card className="group h-full border-transparent bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
        <div className="space-y-3">
          <Badge className="bg-emerald-50 text-emerald-700">{name}</Badge>
          <p className="text-sm text-slate-600 group-hover:text-slate-800">
            Explore curated {name.toLowerCase()} dishes.
          </p>
        </div>
      </Card>
    </Link>
  );
}

