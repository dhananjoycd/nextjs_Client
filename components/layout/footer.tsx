"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getRoleHomePath } from "@/lib/auth";
import { routes } from "@/lib/routes";

export function Footer() {
  const { user, loading } = useAuth();
  const roleHome = getRoleHomePath(user?.role);
  const roleLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "PROVIDER" ? "Provider" : "Customer";

  return (
    <footer className="mt-16 border-t border-slate-800 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-6">


        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div>
              <p className="text-2xl font-semibold text-white">FoodHub</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                A role-aware meal marketplace where customers order with confidence, providers grow revenue, and admins keep operations healthy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Product</p>
            <div className="space-y-2 text-sm">
              <Link href={routes.home} className="block transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/categories" className="block transition-colors hover:text-white">
                Categories
              </Link>
              <Link href={routes.meals} className="block transition-colors hover:text-white">
                Meals
              </Link>
              <Link href={routes.providers} className="block transition-colors hover:text-white">
                Providers
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Company</p>
            <div className="space-y-2 text-sm">
              <Link href={routes.about} className="block transition-colors hover:text-white">
                About Us
              </Link>
              <Link href={routes.contact} className="block transition-colors hover:text-white">
                Contact
              </Link>
              <Link href="/faq" className="block transition-colors hover:text-white">
                FAQ
              </Link>
              <Link href={routes.privacy} className="block transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <Link href={routes.terms} className="block transition-colors hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Account</p>
            <div className="space-y-2 text-sm">
              {!loading && !user && (
                <>
                  <Link href={routes.login} className="block transition-colors hover:text-white">
                    Login
                  </Link>
                  <Link href={routes.register} className="block transition-colors hover:text-white">
                    Register
                  </Link>
                </>
              )}
              {!loading && user && (
                <>
                  <Link href={roleHome} className="block transition-colors hover:text-white">
                    {roleLabel} Dashboard
                  </Link>
                  <Link href="/profile" className="block transition-colors hover:text-white">
                    Public Profile
                  </Link>
                  {user.role === "CUSTOMER" && (
                    <Link href={routes.customerOrders} className="block transition-colors hover:text-white">
                      My Orders
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2 pt-2 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>Dhaka, Bangladesh</span>
              </p>
              <a href="tel:+8801234567890" className="flex items-center gap-2 transition-colors hover:text-white">
                <Phone className="size-4 shrink-0 text-emerald-400" />
                <span>+880 1234 567890</span>
              </a>
              <a href="mailto:support@foodhub.app" className="flex items-center gap-2 transition-colors hover:text-white">
                <Mail className="size-4 shrink-0 text-emerald-400" />
                <span className="break-all">support@foodhub.app</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} FoodHub. Crafted for scalable food operations.</p>
        <p className="mt-1">
          Developed by {" "}
          <a
            href="https://github.com/dhananjoycd"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-300 transition-colors hover:text-white"
          >
            Dhananjoy Chandra Das
          </a>
        </p>
      </div>
    </footer>
  );
}
