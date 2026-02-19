import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
