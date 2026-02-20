"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/dashboard/shell";
import { Badge, Button, Card } from "@/components/ui";
import { ordersService } from "@/services";
import type { Order } from "@/types";

const LIVE_REFRESH_MS = 5_000;

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "CANCELED") return "bg-rose-50 text-rose-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function OrdersPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [updatingId, setUpdatingId] = useState("");
  const paymentToastShown = useRef(false);
  const orderStatusRef = useRef<Record<string, string>>({});

  const fetchOrders = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      const data = await ordersService.my(token);
      const nextOrders = Array.isArray(data) ? data : [];
      const previousStatuses = orderStatusRef.current;
      const nextStatuses: Record<string, string> = {};

      for (const order of nextOrders) {
        nextStatuses[order.id] = order.status;
        const previous = previousStatuses[order.id];
        if (silent && previous && previous !== order.status) {
          toast.success(`Order #${order.id.slice(0, 8)} is now ${order.status}`);
        }
      }

      orderStatusRef.current = nextStatuses;
      setOrders(nextOrders);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => {
      void fetchOrders(true);
    }, LIVE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchOrders, token]);

  useEffect(() => {
    if (paymentToastShown.current) return;
    if (searchParams.get("payment") !== "success") return;
    paymentToastShown.current = true;
    toast.success("Payment completed successfully");
  }, [searchParams]);

  async function refreshOrders() {
    try {
      setRefreshing(true);
      await fetchOrders(true);
    } finally {
      setRefreshing(false);
    }
  }

  async function cancelOrder(orderId: string) {
    if (!token) return;
    try {
      setUpdatingId(orderId);
      await ordersService.updateStatus(token, orderId, "CANCELED");
      toast.success("Order cancelled");
      await fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setUpdatingId("");
    }
  }

  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) =>
    ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status),
  ).length;
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;
  const canceledOrders = orders.filter((order) => order.status === "CANCELED").length;
  const totalSpent = orders.reduce((sum, order) => {
    if (order.status === "CANCELED") return sum;
    return sum + Number(order.totalAmount ?? 0);
  }, 0);

  return (
    <Protected roles={["CUSTOMER"]}>
      <DashboardShell
        title="Order History"
        description="Track all your placed orders with detailed status."
        hideNav
        links={[
          { href: "/cart", label: "Cart" },
          { href: "/orders", label: "Orders", active: true },
          { href: "/profile", label: "Profile" },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="space-y-1 border-sky-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total Orders</p>
            <p className="text-3xl font-semibold text-sky-700">{totalOrders}</p>
          </Card>
          <Card className="space-y-1 border-amber-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Active Orders</p>
            <p className="text-3xl font-semibold text-amber-700">{activeOrders}</p>
          </Card>
          <Card className="space-y-1 border-emerald-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Delivered</p>
            <p className="text-3xl font-semibold text-emerald-700">{deliveredOrders}</p>
          </Card>
          <Card className="space-y-1 border-rose-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Canceled</p>
            <p className="text-3xl font-semibold text-rose-700">{canceledOrders}</p>
          </Card>
          <Card className="space-y-1 border-violet-100">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total Spent</p>
            <p className="text-3xl font-semibold text-violet-700">${totalSpent.toFixed(2)}</p>
          </Card>
        </div>

        <Card className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            Live stats refresh every {LIVE_REFRESH_MS / 1000}s
            {lastUpdated ? ` - Last update ${lastUpdated}` : ""}
          </p>
          <Button variant="outline" onClick={refreshOrders} disabled={refreshing}>
            {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh
          </Button>
        </Card>

        {loading ? (
          <Card>Loading orders...</Card>
        ) : orders.length === 0 ? (
          <Card>No orders yet.</Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const total = Number(order.totalAmount ?? 0);
              const isPending = order.status === "PENDING";
              return (
                <Card key={order.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <Badge className={statusClass(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">Placed at: {formatDate(order.createdAt)}</p>
                  <p className="text-sm text-slate-600">Total: ${total.toFixed(2)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/orders/${order.id}`}>
                        View Details <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    {isPending && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelOrder(order.id)}
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id ? "Canceling..." : "Cancel Order"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardShell>
    </Protected>
  );
}
