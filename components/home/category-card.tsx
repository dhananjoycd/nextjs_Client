import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge, Card } from "@/components/ui";

type CategoryCardProps = {
  name: string;
  href: string;
  mealCount?: number;
  imageSrc?: string;
  imagePosition?: string;
  overlayToneClass?: string;
  className?: string;
};

export function CategoryCard({
  name,
  href,
  mealCount = 0,
  imageSrc,
  imagePosition = "center",
  overlayToneClass = "from-emerald-900/70 via-slate-900/30 to-amber-900/60",
  className = "",
}: CategoryCardProps) {
  const totalMeals = Number.isFinite(mealCount) ? mealCount : 0;
  const backgroundStyle = imageSrc
    ? {
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: imagePosition,
      }
    : undefined;

  return (
    <Link
      href={href}
      aria-label={`Browse ${name} meals`}
      className={`group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${className}`}
    >
      <Card className="relative h-full min-h-[140px] overflow-hidden border-slate-200/80 p-0 shadow-[0_8px_28px_rgba(15,23,42,0.12)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(15,23,42,0.18)] sm:min-h-[180px] lg:min-h-[220px]">
        <div
          role="img"
          aria-label={`${name} category meals`}
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={backgroundStyle}
        />

        <div className={`absolute inset-0 bg-gradient-to-br ${overlayToneClass}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 to-transparent" />

        <div className="relative flex h-full flex-col justify-end p-3 sm:p-4 lg:p-5">
          <div className="mb-2 flex items-start justify-start">
            <Badge className="border border-white/30 bg-white/25 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:text-xs">
              {totalMeals} meals
            </Badge>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white sm:text-xl lg:text-2xl">{name}</h3>

            <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200 transition-all group-hover:gap-2 group-hover:text-emerald-100 sm:text-sm lg:text-base">
              Explore
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
