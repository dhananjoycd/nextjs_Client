"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";

export function Footer() {
  const { user, loading } = useAuth();
  const roleHome = getRoleHomePath(user?.role);

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-xl font-semibold text-white">FoodHub</p>
          <p className="text-sm text-slate-400">
            FoodHub connects customers with verified kitchens and premium meals with realtime order flow.
          </p>
          <div className="h-px w-full bg-slate-800" />
          <p className="text-xs text-slate-500">Built for modern food commerce.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Quick Links</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/" className="block hover:text-white">
              Home
            </Link>
            <Link href="/meals" className="block hover:text-white">
              Meals
            </Link>
            <Link href="/providers" className="block hover:text-white">
              Providers
            </Link>
            <Link href="/cart" className="block hover:text-white">
              Cart
            </Link>
            <Link href="/orders" className="block hover:text-white">
              Orders
            </Link>
            {!loading && !user && (
              <>
                <Link href="/login" className="block hover:text-white">
                  Login
                </Link>
                <Link href="/register" className="block hover:text-white">
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <>
                <Link href="/profile" className="block hover:text-white">
                  Profile
                </Link>
                <Link href={roleHome} className="block hover:text-white">
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
          <div className="space-y-2.5 text-sm text-slate-300">
            <p className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <span>Dhaka, Bangladesh</span>
            </p>
            <a
              href="tel:+8801234567890"
              className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 transition-colors hover:border-slate-700 hover:text-white"
            >
              <Phone className="size-4 shrink-0 text-emerald-400" />
              <span>+880 1234 567890</span>
            </a>
            <a
              href="mailto:support@foodhub.app"
              className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 transition-colors hover:border-slate-700 hover:text-white"
            >
              <Mail className="size-4 shrink-0 text-emerald-400" />
              <span className="break-all">support@foodhub.app</span>
            </a>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Twitter className="size-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Instagram className="size-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} FoodHub. All rights reserved.
      </div>
    </footer>
  );
}
