"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import { Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination } from "@/components/ui";
import type { Order } from "@/types";

const PROVIDER_NAV_LINKS = [
  { href: "/dashboard/provider", label: "Dashboard" },
  { href: "/dashboard/provider/meals", label: "Manage Meals" },
  { href: "/dashboard/provider/orders", label: "Order Queue" },
  { href: "/dashboard/provider/earnings", label: "Earnings" },
  { href: "/dashboard/provider/profile", label: "Business Profile" },
];

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

const PAGE_SIZE = 8;
const NEXT_STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
  PENDING: { next: "ACCEPTED", label: "Accept" },
  ACCEPTED: { next: "PREPARING", label: "Start Preparing" },
  PREPARING: { next: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  OUT_FOR_DELIVERY: { next: "DELIVERED", label: "Mark Delivered" },
};
const REJECTABLE_STATUSES = new Set(["PENDING", "ACCEPTED"]);

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "CANCELED") return "bg-rose-50 text-rose-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
}

export default function OrderQueuePage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [orderPage, setOrderPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        String(order.deliveryAddress ?? "").toLowerCase().includes(query) ||
        String(order.customer?.name ?? "").toLowerCase().includes(query) ||
        String(order.customer?.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = useMemo(
    () => filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE),
    [filteredOrders, orderPage],
  );

  useEffect(() => {
    setOrderPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    setOrderPage((prev) => Math.min(prev, totalOrderPages));
  }, [totalOrderPages]);

  async function updateOrderStatus(orderId: string, nextStatus: string, successMessage: string) {
    const previousOrders = orders;
    try {
      setUpdatingOrderId(orderId);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
      await apiRequest(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(successMessage);
    } catch (error) {
      setOrders(previousOrders);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function rejectOrder(orderId: string) {
    try {
      setUpdatingOrderId(orderId);
      await apiRequest(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "CANCELED" }),
      });
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "CANCELED" } : order)));
      toast.success("Order rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject order");
    } finally {
      setUpdatingOrderId("");
    }
  }

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Order Queue"
        description="Manage incoming orders and update their status"
        links={PROVIDER_NAV_LINKS}
      >
        <div className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Search by order id, customer or address"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All status</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">Loading orders...</p>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No orders found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pagedOrders.map((order) => (
                <article key={order.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-slate-600">
                        Total ${Number(order.totalAmount ?? 0).toFixed(2)} - {order.items?.length ?? 0} items
                      </p>
                      {order.customer?.name && (
                        <p className="text-xs text-slate-500">
                          Customer: {order.customer.name}
                          {order.customer.email ? ` (${order.customer.email})` : ""}
                        </p>
                      )}
                    </div>
                    <Badge className={statusClass(order.status)}>{order.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    {NEXT_STATUS_ACTIONS[order.status] ? (
                      <Button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            NEXT_STATUS_ACTIONS[order.status].next,
                            `Order moved to ${NEXT_STATUS_ACTIONS[order.status].next}`,
                          )
                        }
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? "Updating..." : NEXT_STATUS_ACTIONS[order.status].label}
                      </Button>
                    ) : null}
                    <Button variant="secondary" onClick={() => setSelectedOrder(order)}>
                      View Details
                    </Button>
                    {REJECTABLE_STATUSES.has(order.status) ? (
                      <Button
                        variant="destructive"
                        onClick={() => rejectOrder(order.id)}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? "Rejecting..." : "Reject"}
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
              <Pagination
                page={orderPage}
                totalPages={totalOrderPages}
                onPageChange={setOrderPage}
                totalItems={filteredOrders.length}
                pageSize={PAGE_SIZE}
                itemLabel="orders"
              />
            </div>
          )}

          <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              {selectedOrder ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-medium">Order ID:</span> {selectedOrder.id}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {selectedOrder.status}
                  </p>
                  <p>
                    <span className="font-medium">Customer:</span> {selectedOrder.customer?.name ?? "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedOrder.customer?.email ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {selectedOrder.deliveryAddress ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Items:</span> {selectedOrder.items?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </Protected>
  );
}
