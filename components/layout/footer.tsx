import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
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
          <div className="space-y-2 text-sm">
            <Link href="/" className="block hover:text-white">
              Home
            </Link>
            <Link href="/meals" className="block hover:text-white">
              Meals
            </Link>
            <Link href="/providers" className="block hover:text-white">
              Providers
            </Link>
            <Link href="/login" className="block hover:text-white">
              Login
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
          <div className="space-y-2 text-sm text-slate-300">
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" /> Dhaka, Bangladesh
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="size-4 text-emerald-400" /> +880 1234 567890
            </p>
            <p className="inline-flex items-center gap-2">
              <Mail className="size-4 text-emerald-400" /> support@foodhub.app
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <a href="#" aria-label="Facebook" className="rounded-lg bg-slate-900 p-2 hover:bg-slate-800">
              <Facebook className="size-4" />
            </a>
            <a href="#" aria-label="Twitter" className="rounded-lg bg-slate-900 p-2 hover:bg-slate-800">
              <Twitter className="size-4" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-lg bg-slate-900 p-2 hover:bg-slate-800">
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
