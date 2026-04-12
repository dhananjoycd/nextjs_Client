import Link from "next/link";
import { Card } from "@/components/ui";

export default function BlogPage() {
  return (
    <div className="space-y-4 py-2">
      <h1 className="text-3xl font-semibold">FoodHub Blog</h1>
      <Card>
        <p className="text-sm text-slate-600">Blog content is ready for publishing workflows.</p>
        <p className="mt-2 text-sm text-slate-600">
          For updates and announcements, please visit <Link href="/contact" className="text-emerald-700 underline">Contact</Link>.
        </p>
      </Card>
    </div>
  );
}
