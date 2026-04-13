"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { ordersService } from "@/services";
import { Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, formatDateTime, includesText } from "@/app/dashboard/admin/_shared";
import type { Order } from "@/types";

function getOrderProviderNames(order: Order) {
  const names = new Set<string>();
  for (const item of order.items ?? []) {
    const name = item.meal?.provider?.name?.trim();
    if (name) names.add(name);
  }
  return Array.from(names);
}

function statusBadge(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "CANCELED") return "bg-rose-50 text-rose-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
}

export default function AdminOrdersPage() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const list = await ordersService.list(token);
      setOrders(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
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
      if (!search.trim()) return true;
      return (
        includesText(order.id, search) ||
        includesText(order.customer?.name, search) ||
        includesText(order.customer?.email, search) ||
        includesText(order.deliveryAddress, search)
      );
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ADMIN_PAGE_SIZE));
  const pagedOrders = useMemo(
    () => filteredOrders.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredOrders, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Orders" description="Track all platform orders." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Search order/customer/address"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading orders...</p>
          ) : (
            <>
              <div className="space-y-2">
                {pagedOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-slate-600">
                          {order.customer?.name ?? "Unknown"} - ${Number(order.totalAmount ?? 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">Providers: {getOrderProviderNames(order).join(", ") || "-"}</p>
                      </div>
                      <Badge className={statusBadge(order.status)}>{order.status}</Badge>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        View Details
                      </Button>
                    </div>
                  </article>
                ))}
                {pagedOrders.length === 0 && <p className="text-sm text-slate-500">No orders found.</p>}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredOrders.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="orders"
              />
            </>
          )}
        </Card>

        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                <p><span className="font-medium">Customer:</span> {selectedOrder.customer?.name ?? "-"}</p>
                <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email ?? "-"}</p>
                <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium">Total:</span> ${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}</p>
                <p><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress ?? "-"}</p>
                <p><span className="font-medium">Created:</span> {formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
