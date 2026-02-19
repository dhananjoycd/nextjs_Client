"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/dashboard/shell";
import { Badge, Button, Card } from "@/components/ui";
import { ordersService } from "@/services";
import type { Order } from "@/types";

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
  const [updatingId, setUpdatingId] = useState("");
  const paymentToastShown = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await ordersService.my(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (paymentToastShown.current) return;
    if (searchParams.get("payment") !== "success") return;
    paymentToastShown.current = true;
    toast.success("Payment completed successfully");
  }, [searchParams]);

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

  return (
    <Protected roles={["CUSTOMER"]}>
      <DashboardShell
        title="Order History"
        description="Track all your placed orders with detailed status."
        links={[
          { href: "/cart", label: "Cart" },
          { href: "/orders", label: "Orders", active: true },
          { href: "/profile", label: "Profile" },
        ]}
      >
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
