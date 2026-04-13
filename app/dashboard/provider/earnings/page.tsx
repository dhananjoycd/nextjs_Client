"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import { Card } from "@/components/ui";
import type { Order } from "@/types";

const PROVIDER_NAV_LINKS = [
  { href: "/dashboard/provider", label: "Dashboard" },
  { href: "/dashboard/provider/meals", label: "Manage Meals" },
  { href: "/dashboard/provider/orders", label: "Order Queue" },
  { href: "/dashboard/provider/earnings", label: "Earnings" },
  { href: "/dashboard/provider/profile", label: "Business Profile" },
];

export default function EarningsPage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const orderEndpoints = [
        { url: "/api/v1/orders/incoming", skipAuthHandling: false },
        { url: "/api/v1/orders", skipAuthHandling: true },
      ];
      let data: Order[] = [];
      for (const endpoint of orderEndpoints) {
        try {
          const result = await apiRequest<Order[]>(endpoint.url, {
            token,
            skipAuthHandling: endpoint.skipAuthHandling,
          });
          data = Array.isArray(result) ? result : [];
          break;
        } catch {
          continue;
        }
      }
      setOrders(data);
    } catch {
      toast.error("Failed to load earnings data");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "DELIVERED");
    const total = delivered.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const today = new Date().toDateString();
    const todayEarnings = delivered
      .filter((o) => new Date(o.createdAt || "").toDateString() === today)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    return [
      { label: "Total Orders", value: orders.length.toString() },
      { label: "Delivered", value: delivered.length.toString() },
      { label: "Total Revenue", value: `$${total.toFixed(2)}` },
      { label: "Today's Earnings", value: `$${todayEarnings.toFixed(2)}` },
    ];
  }, [orders]);

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Earnings Dashboard"
        description="Track your revenue and earnings analytics"
        links={PROVIDER_NAV_LINKS}
      >
        <div className="space-y-6">

          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">Loading earnings data...</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-6 text-center">
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </Card>
              ))}
            </div>
          )}

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">Recent Deliveries</h2>
            <div className="mt-4 space-y-2">
              {orders
                .filter((o) => o.status === "DELIVERED")
                .slice(0, 5)
                .map((order) => (
                  <div key={order.id} className="flex justify-between rounded-lg border border-slate-200 p-3">
                    <span className="text-sm text-slate-600">Order {order.id}</span>
                    <span className="font-semibold text-slate-900">${Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </DashboardShell>
    </Protected>
  );
}
