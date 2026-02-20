"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, UserCircle2 } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const guestLinks = [
  { href: "/", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/providers", label: "Providers" },
];

const customerLinks = [
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

function isLinkActive(pathname: string, href: string) {
  const [path] = href.split("#");
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({
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
        "relative text-sm font-medium text-slate-700 transition-colors hover:text-slate-900",
        active && "text-slate-900",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300",
          active ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks =
    user?.role === "CUSTOMER"
      ? [...guestLinks, ...customerLinks]
      : user?.role === "PROVIDER"
        ? [
            { href: "/provider/dashboard", label: "Provider Dashboard" },
            { href: "/meals", label: "Meals" },
          ]
        : user?.role === "ADMIN"
          ? [{ href: "/admin", label: "Admin Dashboard" }]
          : guestLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <ShoppingBag className="size-4" />
          </span>
          FoodHub
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <div className="group" key={link.href}>
              <NavLink href={link.href} label={link.label} active={isLinkActive(pathname, link.href)} />
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Button asChild variant="secondary" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <UserCircle2 className="size-4" />
                  <Badge className="px-1.5 py-0 text-[10px] uppercase">
                    {user.role}
                  </Badge>
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.role}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "CUSTOMER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "PROVIDER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/provider/dashboard">Provider Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-rose-600 focus:text-rose-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button size="icon" variant="secondary" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="space-y-6">
            <SheetTitle>Menu</SheetTitle>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    isLinkActive(pathname, link.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2 border-t border-slate-200 pt-4">
              {!user ? (
                <>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              ) : (
                <Button variant="destructive" className="w-full" onClick={logout}>
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
