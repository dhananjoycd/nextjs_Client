"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Twitter,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button } from "@/components/ui";
import { getRoleHomePath, normalizeRole } from "@/lib/auth";
import { routes } from "@/lib/routes";

type FooterLink = {
  href: string;
  label: string;
};

const marketplaceLinks: FooterLink[] = [
  { href: routes.home, label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: routes.meals, label: "Meals" },
  { href: routes.providers, label: "Providers" },
];

const companyLinks: FooterLink[] = [
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: routes.privacy, label: "Privacy" },
  { href: routes.terms, label: "Terms" },
];

const roleFooterLinks = {
  CUSTOMER: [
    { href: routes.customerDashboard, label: "Customer dashboard" },
    { href: routes.customerOrders, label: "Order history" },
    { href: routes.customerWishlist, label: "Wishlist" },
    { href: routes.customerProfile, label: "Profile settings" },
  ],
  PROVIDER: [
    { href: routes.providerDashboard, label: "Provider dashboard" },
    { href: "/dashboard/provider/meals", label: "Manage meals" },
    { href: "/dashboard/provider/orders", label: "Order queue" },
    { href: "/dashboard/provider/earnings", label: "Earnings" },
  ],
  ADMIN: [
    { href: routes.adminDashboard, label: "Admin overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/orders", label: "Orders" },
    { href: "/dashboard/admin/settings", label: "Settings" },
  ],
} as const;

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="space-y-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-slate-400 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const { user, loading } = useAuth();
  const role = normalizeRole(user?.role);
  const roleHome = getRoleHomePath(user?.role);
  const accountLinks = user
    ? [...roleFooterLinks[role]]
    : [
        { href: routes.login, label: "Login" },
        { href: routes.register, label: "Create account" },
      ];

  return (
    <footer className="mt-18 border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_28%),linear-gradient(180deg,#0f172a,#020617)] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <Badge className="w-fit bg-emerald-500/15 text-emerald-200">
                  <Sparkles className="mr-1 size-3.5" />
                  FoodHub marketplace
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Professional food commerce for customers, kitchens, and operations teams.
                  </h2>
                  <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                    FoodHub combines discovery, ordering, role-based workflows, and support into one polished marketplace experience.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Trusted flow</p>
                  <p className="mt-2 text-lg font-semibold text-white">Customer to delivery</p>
                  <p className="mt-1 text-sm text-slate-400">Search, checkout, tracking, and support in one flow.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Role control</p>
                  <p className="mt-2 text-lg font-semibold text-white">Customer, Provider, Admin</p>
                  <p className="mt-1 text-sm text-slate-400">Each role sees the right workspace, actions, and insights.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.24)] backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Your Workspace
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {user ? `Signed in as ${role}` : "Ready to get started?"}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {user
                ? "Open your role-based workspace, monitor activity, and continue from where you left off."
                : "Create an account to unlock ordering, provider operations, or admin access."}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild className="justify-between rounded-2xl">
                <Link href={user ? roleHome : routes.register}>
                  {user ? "Open dashboard" : "Create account"}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between rounded-2xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
                <Link href={routes.contact}>
                  Contact support
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <Store className="size-4.5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-white">FoodHub</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Curated meal operations</p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                Built for reliable ordering, provider growth, and operational clarity with a cleaner, more professional product experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>

          <FooterColumn title="Marketplace" links={marketplaceLinks} />
          <FooterColumn title="Company" links={companyLinks} />

          <div className="space-y-5">
            <FooterColumn title={user ? `${role} Access` : "Account"} links={accountLinks} />

            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="size-4 text-emerald-300" />
                Operational Contact
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                  <span>Dhaka, Bangladesh</span>
                </p>
                <a
                  href="tel:+8801234567890"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-emerald-300" />
                  <span>+880 1234 567890</span>
                </a>
                <a
                  href="mailto:support@foodhub.app"
                  className="flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-emerald-300" />
                  <span className="break-all">support@foodhub.app</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} FoodHub. Designed for scalable food marketplace operations.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>{loading ? "Checking session..." : user ? `${role} session active` : "Guest session"}</span>
            <span className="hidden sm:inline">•</span>
            <span>Responsive, role-based, production-minded UI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
