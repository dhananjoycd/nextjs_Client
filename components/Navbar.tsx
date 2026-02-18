"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/meals", label: "Meals" },
    { href: "/providers", label: "Providers" },
    { href: "/cart", label: "Cart" },
    { href: "/orders", label: "Orders" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          FoodHub
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "font-bold text-teal-700" : "text-slate-700"}
            >
              {link.label}
            </Link>
          ))}
          {!mounted || !user ? (
            <>
              <Link href="/login" className="btn btn-outline">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="status-pill">
                {user.name} ({user.role})
              </span>
              {user.role === "PROVIDER" && (
                <Link href="/provider/dashboard" className="btn btn-secondary">
                  Provider
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="btn btn-secondary">
                  Admin
                </Link>
              )}
              <button className="btn btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
