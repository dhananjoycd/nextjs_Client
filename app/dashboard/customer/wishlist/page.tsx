"use client";

import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card } from "@/components/ui";
import { routes } from "@/lib/routes";

export default function WishlistPage() {
  return (
    <Protected roles={["CUSTOMER"]}>
      <DashboardShell
        title="Wishlist"
        description="Your saved meals will appear here."
        links={[
          { href: routes.cart, label: "Cart" },
          { href: routes.customerOrders, label: "Orders" },
          { href: routes.customerWishlist, label: "Wishlist", active: true },
          { href: routes.customerProfile, label: "Profile" },
        ]}
      >
        <Card>
          <p className="text-sm text-slate-600">Wishlist is ready for future integration.</p>
        </Card>
      </DashboardShell>
    </Protected>
  );
}
