"use client";

import Link from "next/link";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

export function Footer() {
  const { user, loading } = useAuth();
  const roleHome = getRoleHomePath(user?.role);

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-5 lg:px-6">
        <div className="mb-10 grid gap-4 rounded-[2rem] border border-slate-800 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.3)] md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Stay in the loop</p>
            <h2 className="text-2xl font-semibold text-white">Need help choosing meals for today?</h2>
            <p className="text-sm text-slate-400">
              Explore curated meals, trusted providers, and checkout support built for busy customers.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
            <Link
              href={routes.meals}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              Explore Meals <ArrowRight className="size-4" />
            </Link>
            <Link
              href={routes.contact}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-4">
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
            <Link href={routes.home} className="block hover:text-white">
              Home
            </Link>
            <Link href={routes.meals} className="block hover:text-white">
              Meals
            </Link>
            <Link href={routes.providers} className="block hover:text-white">
              Providers
            </Link>
            <Link href={routes.cart} className="block hover:text-white">
              Cart
            </Link>
            <Link href={routes.customerOrders} className="block hover:text-white">
              Orders
            </Link>
            {!loading && !user && (
              <>
                <Link href={routes.login} className="block hover:text-white">
                  Login
                </Link>
                <Link href={routes.register} className="block hover:text-white">
                  Register
                </Link>
              </>
            )}
            {!loading && user && (
              <>
                <Link href={routes.customerProfile} className="block hover:text-white">
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
          <div className="space-y-2 text-sm">
            <Link href={routes.about} className="block hover:text-white">
              About Us
            </Link>
            <Link href={routes.contact} className="block hover:text-white">
              Contact & Support
            </Link>
            <Link href={routes.privacy} className="block hover:text-white">
              Privacy Policy
            </Link>
            <Link href={routes.terms} className="block hover:text-white">
              Terms of Service
            </Link>
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
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} FoodHub. All rights reserved.
      </div>
    </footer>
  );
}
