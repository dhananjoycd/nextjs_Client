import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-white/80">
      <div className="mx-auto grid max-w-[1100px] gap-5 px-4 py-8 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-slate-800">FoodHub</p>
          <p>Discover and order delicious meals from trusted providers.</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Quick Links</p>
          <Link className="block hover:text-emerald-700" href="/meals">
            Meals
          </Link>
          <Link className="block hover:text-emerald-700" href="/providers">
            Providers
          </Link>
          <Link className="block hover:text-emerald-700" href="/login">
            Login
          </Link>
        </div>
        <div className="md:text-right">
          <p>&copy; FoodHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
