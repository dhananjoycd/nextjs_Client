"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShoppingBag, UserCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/providers", label: "Providers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const pagesLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const customerLinks = [
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

function getAccountMenuLink(role?: string) {
  if (role === "CUSTOMER") return { href: "/profile", label: "My Profile" };
  if (role === "PROVIDER") return { href: "/provider/dashboard", label: "Provider Dashboard" };
  if (role === "ADMIN") return { href: "/admin", label: "Admin Dashboard" };
  return null;
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
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountMenuLink = getAccountMenuLink(user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const roleLinks = useMemo(() => {
    if (user?.role === "CUSTOMER") return customerLinks;
    if (user?.role === "PROVIDER") return [{ href: "/provider/dashboard", label: "Provider Dashboard" }];
    if (user?.role === "ADMIN") return [{ href: "/admin", label: "Admin Dashboard" }];
    return [];
  }, [user?.role]);

  const quickActionHref = user ? getRoleHomePath(user.role) : "/register";
  const quickActionLabel = user ? (user.role === "ADMIN" ? "Admin dashboard" : user.role === "PROVIDER" ? "Provider dashboard" : "Open dashboard") : "Start ordering";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-white/60 bg-white/55 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
          : "bg-white/35 backdrop-blur-xl",
      )}
    >
      <nav className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-4 sm:px-5 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold">
          <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <ShoppingBag className="size-4" />
          </span>
          <span className="leading-none">
            FoodHub
            <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Curated meals
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 rounded-full border border-white/60 bg-white/55 px-5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] lg:flex">
          {primaryLinks.map((link) => (
            <div className="group" key={link.href}>
              <NavLink href={link.href} label={link.label} active={isLinkActive(pathname, link.href)} />
            </div>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-transparent p-0 text-sm font-medium text-slate-700 outline-none transition-colors hover:text-slate-900 focus-visible:ring-0"
              >
                More <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 rounded-2xl border-white/70 bg-white/90 backdrop-blur-xl">
              <DropdownMenuLabel>Explore More Pages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pagesLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4 text-slate-700 hover:bg-white/70">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5 shadow-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/65 bg-white/60 px-2.5 shadow-sm hover:bg-white"
                  aria-label="Open account menu"
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900 text-white">
                    <UserCircle2 className="size-4" />
                  </span>
                  <ChevronDown className="size-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/70 bg-white/90 backdrop-blur-xl">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountMenuLink && (
                  <DropdownMenuItem asChild>
                    <Link href={accountMenuLink.href}>{accountMenuLink.label}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button size="icon" variant="secondary" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm space-y-6">
            <SheetTitle>Menu</SheetTitle>
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
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Company</p>
                <div className="flex flex-col gap-2">
                  {pagesLinks.map((link) => (
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
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {user?.role === "CUSTOMER" ? "My Account" : user?.role}
                  </p>
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
              {!user && (
                <Button asChild variant="outline" className="w-full">
                  <Link href={quickActionHref} onClick={() => setMobileMenuOpen(false)}>
                    {quickActionLabel}
                  </Link>
                </Button>
              )}
              {!user ? (
                <>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              ) : (
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
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
