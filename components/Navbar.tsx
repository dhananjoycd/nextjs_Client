"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getRoleHomePath, normalizeRole } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

type RoleKey = "CUSTOMER" | "PROVIDER" | "ADMIN";

const primaryLinks: NavItem[] = [
  { href: routes.home, label: "Home", description: "Marketplace overview" },
  { href: "/categories", label: "Categories", description: "Browse curated collections" },
  { href: routes.meals, label: "Meals", description: "Explore trending meals" },
  { href: routes.providers, label: "Providers", description: "Discover partner kitchens" },
];

const secondaryLinks: NavItem[] = [
  { href: routes.about, label: "About", description: "Brand story and marketplace vision" },
  { href: routes.contact, label: "Support", description: "Contact and AI assistance" },
  { href: "/faq", label: "FAQ", description: "Fast answers and guidance" },
];

const utilityLinks: NavItem[] = [
  { href: routes.privacy, label: "Privacy" },
  { href: routes.terms, label: "Terms" },
];

const roleFeatureLinks: Record<
  RoleKey,
  Array<NavItem & { emphasis?: "primary" | "secondary" }>
> = {
  CUSTOMER: [
    { href: routes.customerDashboard, label: "Dashboard", description: "Your account hub", emphasis: "primary" },
    { href: routes.cart, label: "Cart", description: "Review pending items", emphasis: "primary" },
    { href: routes.customerOrders, label: "My Orders", description: "Track active and past orders" },
    { href: routes.customerWishlist, label: "Wishlist", description: "Saved meals and favorites" },
    { href: routes.customerProfile, label: "Profile Settings", description: "Manage personal details" },
  ],
  PROVIDER: [
    { href: routes.providerDashboard, label: "Dashboard", description: "Business performance", emphasis: "primary" },
    { href: "/dashboard/provider/meals", label: "Manage Meals", description: "Update listings and pricing", emphasis: "primary" },
    { href: "/dashboard/provider/orders", label: "Order Queue", description: "Review incoming fulfillment" },
    { href: "/dashboard/provider/earnings", label: "Earnings", description: "Revenue and payouts" },
    { href: "/dashboard/provider/profile", label: "Business Profile", description: "Kitchen and brand information" },
  ],
  ADMIN: [
    { href: routes.adminDashboard, label: "Admin Overview", description: "Operational control center", emphasis: "primary" },
    { href: "/dashboard/admin/users", label: "Users", description: "Customer and staff accounts", emphasis: "primary" },
    { href: "/dashboard/admin/providers", label: "Providers", description: "Marketplace partner health" },
    { href: "/dashboard/admin/orders", label: "Orders", description: "System-wide fulfillment tracking" },
    { href: "/dashboard/admin/reviews", label: "Reviews", description: "Trust and quality moderation" },
    { href: "/dashboard/admin/settings", label: "Settings", description: "Platform configuration" },
    { href: "/dashboard/admin/audit-logs", label: "Audit Logs", description: "Operational activity history" },
  ],
};

function getRoleFeatureLinks(role?: string) {
  const normalized = normalizeRole(role);
  return roleFeatureLinks[normalized] ?? [];
}

function isLinkActive(pathname: string, href: string) {
  const [path] = href.split("#");
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {label}
    </Link>
  );
}

function MobileNavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-2xl border px-4 py-3 transition-colors",
              isLinkActive(pathname, item.href)
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            {item.description ? (
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roleLinks = useMemo(() => getRoleFeatureLinks(user?.role), [user?.role]);
  const roleHome = useMemo(() => getRoleHomePath(user?.role), [user?.role]);
  const role = normalizeRole(user?.role);
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";
  const roleSummary =
    role === "ADMIN"
      ? "Platform controls"
      : role === "PROVIDER"
        ? "Kitchen operations"
        : "Orders and profile";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/70 bg-white/86 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
          : "border-transparent bg-white/72 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-3">
          <Link href={routes.home} className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1e293b)] text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
              <ShoppingBag className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                FoodHub
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.22em] text-slate-500 sm:block">
                Role-aware commerce
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/92 p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
              {primaryLinks.map((link) => (
                <NavPill
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isLinkActive(pathname, link.href)}
                />
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Explore <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-72 rounded-3xl border-white/80 bg-white/96 p-2 backdrop-blur-2xl"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    More Pages
                  </DropdownMenuLabel>
                  {secondaryLinks.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-2xl px-3 py-3">
                      <Link href={item.href} className="flex flex-col items-start">
                        <span className="font-medium text-slate-900">{item.label}</span>
                        {item.description ? (
                          <span className="text-xs text-slate-500">{item.description}</span>
                        ) : null}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {utilityLinks.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-2xl px-3 py-2.5">
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {!loading && !user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                  <Link href={routes.login}>Login</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-5 shadow-sm">
                  <Link href={routes.register}>Get Started</Link>
                </Button>
              </>
            ) : null}

            {user ? (
              <>
                {role === "CUSTOMER" ? (
                  <Button asChild variant="outline" size="sm" className="rounded-full border-slate-200 bg-white/90 px-4">
                    <Link href={routes.cart}>
                      <ShoppingCart className="size-4" />
                      Cart
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="rounded-full border-slate-200 bg-white/90 px-4">
                    <Link href={roleHome}>
                      <LayoutDashboard className="size-4" />
                      {role === "ADMIN" ? "Admin" : "Dashboard"}
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto rounded-[1.5rem] border border-slate-200/90 bg-white/92 px-2.5 py-2 shadow-sm hover:bg-white"
                    >
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                        {initial}
                      </span>
                      <div className="hidden min-w-0 text-left lg:block">
                        <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{roleSummary}</p>
                      </div>
                      <Badge className="hidden rounded-full bg-emerald-100 text-emerald-700 lg:inline-flex">
                        {role}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[22rem] rounded-3xl border-white/80 bg-white/97 p-2 backdrop-blur-2xl"
                  >
                    <DropdownMenuLabel className="rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-3">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                          {initial}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge className="bg-emerald-100 text-emerald-700">{role}</Badge>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {roleSummary}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <div className="grid gap-2 p-1.5">
                      {roleLinks.map((link) => (
                        <DropdownMenuItem key={link.href} asChild className="rounded-2xl px-3 py-3">
                          <Link href={link.href} className="flex flex-col items-start">
                            <span className="font-medium text-slate-900">{link.label}</span>
                            {link.description ? (
                              <span className="text-xs text-slate-500">{link.description}</span>
                            ) : null}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>

                    <DropdownMenuSeparator />

                    <div className="grid gap-2 p-1.5">
                      <DropdownMenuItem asChild className="rounded-2xl px-3 py-3">
                        <Link href={routes.contact} className="flex items-center gap-2">
                          <Sparkles className="size-4 text-emerald-600" />
                          Support & help
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-2xl px-3 py-3">
                        <Link href={routes.meals} className="flex items-center gap-2">
                          <Search className="size-4 text-slate-500" />
                          Explore marketplace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={logout}
                        className="rounded-2xl px-3 py-3 text-rose-600 focus:text-rose-600"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="ml-auto md:hidden">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full border-slate-200 bg-white/88 shadow-sm"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="h-dvh w-[92vw] max-w-sm overflow-y-auto border-l-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-5 pb-6 pt-5 backdrop-blur-2xl"
            >
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Browse the marketplace and open role-based tools from one menu.
              </SheetDescription>

              <div className="mt-5 space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))] p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white/14 text-sm font-semibold">
                      {user ? initial : "F"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                        {user ? role : "Guest access"}
                      </p>
                      <p className="mt-1 truncate text-lg font-semibold">
                        {user?.name ?? "FoodHub navigation"}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {user
                          ? `Open ${roleSummary.toLowerCase()} and marketplace shortcuts.`
                          : "Discover meals, provider pages, support resources, and account entry points."}
                      </p>
                    </div>
                  </div>
                </div>

                <MobileNavSection
                  title="Marketplace"
                  items={primaryLinks}
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                <MobileNavSection
                  title="Explore"
                  items={secondaryLinks}
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                {user ? (
                  <MobileNavSection
                    title={`${role} Tools`}
                    items={roleLinks}
                    pathname={pathname}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ) : null}

                <MobileNavSection
                  title="Policies"
                  items={utilityLinks}
                  pathname={pathname}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quick Actions
                  </p>
                  <div className="mt-3 grid gap-2">
                    {!user ? (
                      <>
                        <Button asChild variant="secondary" className="w-full rounded-2xl">
                          <Link href={routes.login} onClick={() => setMobileMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button asChild className="w-full rounded-2xl">
                          <Link href={routes.register} onClick={() => setMobileMenuOpen(false)}>
                            Create account
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild className="w-full rounded-2xl">
                          <Link href={roleHome} onClick={() => setMobileMenuOpen(false)}>
                            <UserCircle2 className="size-4" />
                            {role === "ADMIN"
                              ? "Open admin workspace"
                              : role === "PROVIDER"
                                ? "Open provider workspace"
                                : "Open customer dashboard"}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl border-slate-200"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                        >
                          <LogOut className="size-4" />
                          Sign out
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-slate-700">
                  <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Role-based navigation active
                  </p>
                  <p className="mt-2 text-slate-600">
                    Menu items adapt to the signed-in role so each user sees the tools that matter most.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
