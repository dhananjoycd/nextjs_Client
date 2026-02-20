import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 hover:shadow-md",
        secondary:
          "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:shadow-sm",
        outline:
          "border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100",
        ghost: "text-slate-700 hover:bg-slate-100",
        destructive: "bg-rose-600 text-white hover:bg-rose-500",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-11 rounded-lg px-3",
        lg: "h-12 rounded-xl px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
