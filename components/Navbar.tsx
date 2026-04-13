"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: routes.home, label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: routes.meals, label: "Meals" },
  { href: routes.providers, label: "Providers" },
];

const exploreLinks = [
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const policyLinks = [
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.terms, label: "Terms of Service" },
];

type RoleKey = "CUSTOMER" | "PROVIDER" | "ADMIN";

const roleFeatureLinks: Record<RoleKey, { href: string; label: string }[]> = {
  CUSTOMER: [
    { href: routes.customerDashboard, label: "Dashboard" },
    { href: routes.cart, label: "Cart" },
    { href: routes.customerOrders, label: "My Orders" },
    { href: routes.customerWishlist, label: "Wishlist" },
    { href: routes.customerProfile, label: "Profile Settings" },
  ],
  PROVIDER: [
    { href: routes.providerDashboard, label: "Dashboard" },
    { href: "/dashboard/provider/meals", label: "Manage Meals" },
    { href: "/dashboard/provider/orders", label: "Order Queue" },
    { href: "/dashboard/provider/earnings", label: "Earnings" },
    { href: "/dashboard/provider/profile", label: "Business Profile" },
  ],
  ADMIN: [
    { href: routes.adminDashboard, label: "Admin Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/providers", label: "Providers" },
    { href: "/dashboard/admin/meals", label: "Meals" },
    { href: "/dashboard/admin/orders", label: "Orders" },
    { href: "/dashboard/admin/reviews", label: "Reviews" },
    { href: "/dashboard/admin/settings", label: "Settings" },
    { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
  ],
};

function getRoleFeatureLinks(role?: string) {
  if (role === "CUSTOMER") return roleFeatureLinks.CUSTOMER;
  if (role === "PROVIDER") return roleFeatureLinks.PROVIDER;
  if (role === "ADMIN") return roleFeatureLinks.ADMIN;
  return [];
}

function isLinkActive(pathname: string, href: string) {
  const [path] = href.split("#");
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900",
        active && "text-slate-950",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-2 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-slate-900 transition-all duration-300",
          active ? "w-6" : "w-0 group-hover:w-6",
        )}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const roleLinks = useMemo(() => getRoleFeatureLinks(user?.role), [user?.role]);
  const roleHome = useMemo(() => getRoleHomePath(user?.role), [user?.role]);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/60 bg-white/75 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
          : "bg-white/55 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex min-h-19 max-w-7xl items-center gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <Link href={routes.home} className="inline-flex shrink-0 items-center gap-3 text-lg font-bold">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
            <ShoppingBag className="size-4" />
          </span>
          <span className="leading-none">
            FoodHub
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:block">
              Curated meals
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex w-full max-w-3xl items-center justify-center gap-5 rounded-full border border-slate-200/80 bg-white/85 px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            {primaryLinks.map((link) => (
              <div className="group" key={link.href}>
                <NavLink href={link.href} label={link.label} active={isLinkActive(pathname, link.href)} />
              </div>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                >
                  More <ChevronDown className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 rounded-2xl border-white/70 bg-white/95 backdrop-blur-xl">
                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {exploreLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {policyLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          {!loading && !user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4 text-slate-700 hover:bg-white/70">
                <Link href={routes.login}>Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5 shadow-sm">
                <Link href={routes.register}>Get Started</Link>
              </Button>
            </>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/65 bg-white/85 px-2.5 shadow-sm hover:bg-white"
                  aria-label="Open account menu"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {initial}
                  </span>
                  <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 lg:block">
                    {user.name}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {user.role}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-2xl border-white/70 bg-white/95 p-1.5 backdrop-blur-xl">
                <DropdownMenuLabel className="space-y-1 rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-600">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {roleLinks.slice(0, 6).map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
        
                <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600">
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="ml-auto md:hidden lg:hidden">
            <Button
              size="icon"
              variant="secondary"
              aria-label="Open menu"
              className="shrink-0 rounded-full border border-white/65 bg-white/75 shadow-sm"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[92vw] max-w-sm space-y-6 border-l-white/70 bg-white/95 px-5 backdrop-blur-xl">
            <SheetTitle>Menu</SheetTitle>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {user ? user.role : "Guest browsing"}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user?.name ?? "Discover your next meal"}
              </p>
              <p className="text-sm text-slate-600">
                {user ? `${user.role} access active` : "Browse meals, providers, and support pages from one place."}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Explore</p>
                <div className="flex flex-col gap-2">
                  {primaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium",
                        isLinkActive(pathname, link.href)
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Explore</p>
                <div className="flex flex-col gap-2">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium",
                        isLinkActive(pathname, link.href)
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Policies</p>
                <div className="flex flex-col gap-2">
                  {policyLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium",
                        isLinkActive(pathname, link.href)
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-700 hover:bg-slate-100",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {roleLinks.length > 0 && (
                <div className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Role Features</p>
                  <div className="flex flex-col gap-2">
                    {roleLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-sm font-medium",
                          isLinkActive(pathname, link.href)
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-700 hover:bg-slate-100",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 border-t border-slate-200 pt-4">
              {!user ? (
                <>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={routes.login} onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href={routes.register} onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={roleHome} onClick={() => setMobileMenuOpen(false)}>
                      {user.role === "ADMIN" ? "Admin Panel" : user.role === "PROVIDER" ? "Provider Panel" : "My Dashboard"}
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
