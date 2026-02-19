"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, Card, Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  title: string;
  description?: string;
  links: Array<{ href: string; label: string; active?: boolean }>;
  children: React.ReactNode;
};

export function DashboardShell({ title, description, links, children }: DashboardShellProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <Card className="sticky top-20 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard</p>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  link.active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Card>
      </aside>

      <div className="space-y-4">
        <Card className="flex items-center justify-between gap-3 lg:hidden">
          <div>
            <h1 className="text-xl">{title}</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="secondary">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle>Dashboard Menu</SheetTitle>
              <nav className="mt-5 space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium",
                      link.active ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </Card>

        <Card className="hidden lg:block">
          <h1 className="text-2xl">{title}</h1>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </Card>
        {children}
      </div>
    </div>
  );
}
