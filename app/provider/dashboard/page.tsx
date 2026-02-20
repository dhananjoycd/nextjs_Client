"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Textarea,
} from "@/components/ui";
import { categoriesService } from "@/services";
import type { Category, Meal, Order } from "@/types";

type ProviderMeal = Meal & {
  isAvailable?: boolean;
};

const ORDERS_PER_PAGE = 6;
const LIVE_REFRESH_MS = 20_000;
const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];
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

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function resolveMealCategoryId(meal: ProviderMeal, categories: Category[]) {
  const raw = meal.category;
  if (!raw) return "";
  if (typeof raw === "object" && raw.id) return raw.id;
  const value = String(typeof raw === "string" ? raw : raw.name ?? raw.slug ?? "").toLowerCase();
  const match = categories.find(
    (category) =>
      category.id.toLowerCase() === value ||
      category.name.toLowerCase() === value ||
      (category.slug ?? "").toLowerCase() === value,
  );
  return match?.id ?? "";
}

function resolveMealTitle(meal: ProviderMeal) {
  return meal.title ?? meal.name ?? "";
}

function resolveMealPrice(meal: ProviderMeal) {
  const value = Number(meal.price ?? 0);
  return Number.isFinite(value) && value > 0 ? String(value) : "";
}

export default function ProviderDashboardPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<ProviderMeal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ProviderMeal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<ProviderMeal | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderPage, setOrderPage] = useState(1);
  const mealFormSeedRef = useRef("");

  const fetchData = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    try {
      if (!silent) setLoading(true);
      const mealEndpoints = [
        `/api/v1/meals?providerId=${encodeURIComponent(user.id)}&limit=100`,
        "/api/v1/meals/my",
        "/api/v1/meals?limit=100",
        "/api/v1/meals",
      ];
      let mealList: ProviderMeal[] = [];
      for (const endpoint of mealEndpoints) {
        try {
          const data = await apiRequest<ProviderMeal[]>(endpoint, { token });
          mealList = Array.isArray(data) ? data : [];
          break;
        } catch {
          continue;
        }
      }

      const [incomingOrdersResult, categoryListResult] = await Promise.allSettled([
        apiRequest<Order[]>("/api/v1/orders/incoming", { token }),
        categoriesService.list(token),
      ]);

      const normalizedOrders =
        incomingOrdersResult.status === "fulfilled" && Array.isArray(incomingOrdersResult.value)
          ? incomingOrdersResult.value
          : [];
      const normalizedCategories =
        categoryListResult.status === "fulfilled" && Array.isArray(categoryListResult.value)
          ? categoryListResult.value
          : [];

      const ownedMeals = mealList.filter((meal) => {
        const directProviderId = String(meal.providerId ?? "");
        const providerId = String(meal.provider?.id ?? "");
        const providerRecord = (meal as Meal & { provider?: { user?: { id?: string }; userId?: string } }).provider;
        const providerUserId = String(providerRecord?.user?.id ?? providerRecord?.userId ?? "");
        return [directProviderId, providerId, providerUserId].includes(user.id);
      });

      setOrders(normalizedOrders);
      setMeals(ownedMeals.length > 0 ? ownedMeals : mealList);
      setCategories(normalizedCategories);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load provider dashboard");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token || !user?.id || openMealDialog) return;
    const timer = window.setInterval(() => {
      void fetchData(true);
    }, LIVE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchData, openMealDialog, token, user?.id]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const inProgress = orders.filter((order) =>
      ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status),
    ).length;
    const delivered = orders.filter((order) => order.status === "DELIVERED");
    const canceled = orders.filter((order) => order.status === "CANCELED").length;
    const todayKey = new Date().toDateString();
    const deliveredToday = delivered.filter((order) => {
      if (!order.createdAt) return false;
      const date = new Date(order.createdAt);
      return !Number.isNaN(date.getTime()) && date.toDateString() === todayKey;
    }).length;
    const deliveredRevenue = delivered.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
    return [
      { label: "Menu Items", value: meals.length.toString() },
      { label: "Incoming Orders", value: orders.length.toString() },
      { label: "Pending Orders", value: pending.toString() },
      { label: "In Progress", value: inProgress.toString() },
      { label: "Delivered Today", value: deliveredToday.toString() },
      { label: "Rejected", value: canceled.toString() },
      { label: "Revenue (Delivered)", value: `$${deliveredRevenue.toFixed(2)}` },
    ];
  }, [meals.length, orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderStatusFilter !== "ALL" && order.status !== orderStatusFilter) {
        return false;
      }

      if (!orderSearch.trim()) return true;
      const query = orderSearch.trim().toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        String(order.deliveryAddress ?? "").toLowerCase().includes(query) ||
        String(order.customer?.name ?? "").toLowerCase().includes(query) ||
        String(order.customer?.email ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const pagedOrders = useMemo(
    () => filteredOrders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE),
    [filteredOrders, orderPage],
  );

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter]);

  useEffect(() => {
    setOrderPage((prev) => Math.min(prev, totalOrderPages));
  }, [totalOrderPages]);

  const mealForm = useForm({
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      isAvailable: "true",
    },
    onSubmit: async ({ value }) => {
      if (!token) throw new Error("Please login again");
      const payload = {
        categoryId: value.categoryId.trim(),
        title: value.title.trim(),
        description: value.description.trim() || undefined,
        price: Number(value.price),
        imageUrl: value.imageUrl.trim() || undefined,
        isAvailable: value.isAvailable === "true",
      };

      if (editingMeal) {
        await apiRequest(`/api/v1/meals/${editingMeal.id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
        toast.success("Menu item updated");
      } else {
        await apiRequest("/api/v1/meals", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
        toast.success("Menu item created");
      }

      setEditingMeal(null);
      setOpenMealDialog(false);
      mealForm.reset();
      await fetchData();
    },
  });

  useEffect(() => {
    if (!openMealDialog) return;
    const nextSeed = editingMeal ? `edit:${editingMeal.id}` : "create";
    if (mealFormSeedRef.current === nextSeed) return;
    mealFormSeedRef.current = nextSeed;

    if (editingMeal) {
      mealForm.reset({
        categoryId: resolveMealCategoryId(editingMeal, categories),
        title: resolveMealTitle(editingMeal),
        description: editingMeal.description ?? "",
        price: resolveMealPrice(editingMeal),
        imageUrl: editingMeal.imageUrl ?? "",
        isAvailable: String(editingMeal.isAvailable ?? true),
      });
      return;
    }
    mealForm.reset({
      categoryId: "",
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      isAvailable: "true",
    });
  }, [categories, editingMeal, mealForm, openMealDialog]);

  useEffect(() => {
    if (!openMealDialog) {
      mealFormSeedRef.current = "";
    }
  }, [openMealDialog]);

  function openCreateMeal() {
    setEditingMeal(null);
    mealForm.reset({
      categoryId: "",
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      isAvailable: "true",
    });
    setOpenMealDialog(true);
  }

  function openEditMeal(meal: ProviderMeal) {
    setEditingMeal(meal);
    setOpenMealDialog(true);
  }

  async function confirmDeleteMeal() {
    if (!token || !deletingMeal) return;
    try {
      await apiRequest(`/api/v1/meals/${deletingMeal.id}`, { method: "DELETE", token });
      toast.success("Menu item deleted");
      setDeletingMeal(null);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete menu item");
    }
  }

  async function updateOrderStatus(orderId: string, nextStatus: string, successMessage: string) {
    if (!token) return;
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
      await fetchData(true);
    } catch (error) {
      setOrders(previousOrders);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function rejectOrder(orderId: string) {
    if (!token) return;
    try {
      setUpdatingOrderId(orderId);
      await apiRequest(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "CANCELED" }),
      });
      toast.success("Order rejected");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject order");
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      await fetchData(true);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Provider Dashboard"
        description="Manage menu items, incoming orders, and delivery pipeline."
        links={[
          { href: "/provider/dashboard", label: "Overview" },
          { href: "/provider/dashboard#provider-analytics", label: "Analytics" },
          { href: "/provider/dashboard#incoming-orders", label: "Incoming Orders" },
          { href: "/provider/dashboard#menu-management", label: "Menu Management" },
        ]}
      >
        {loading ? (
          <Card>Loading dashboard...</Card>
        ) : (
          <>
            <Card className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-600">
                Live stats refresh every {LIVE_REFRESH_MS / 1000}s
                {lastUpdated ? ` - Last update ${lastUpdated}` : ""}
              </p>
              <Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
                {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Refresh
              </Button>
            </Card>

            <div id="provider-analytics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="space-y-1 border-emerald-100">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-semibold text-emerald-700">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card id="incoming-orders" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl">Incoming Orders</h2>
                  <p className="text-sm text-slate-600">Review each order and move it through delivery stages.</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Search by order id, customer or address"
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                />
                <select
                  className="field"
                  value={orderStatusFilter}
                  onChange={(event) => setOrderStatusFilter(event.target.value)}
                >
                  <option value="ALL">All status</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {filteredOrders.length === 0 ? (
                <Card className="border-dashed">
                  <p className="text-sm text-slate-600">No incoming orders.</p>
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
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      disabled={orderPage <= 1}
                      onClick={() => setOrderPage((prev) => prev - 1)}
                    >
                      Prev
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {orderPage} of {totalOrderPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={orderPage >= totalOrderPages}
                      onClick={() => setOrderPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card id="menu-management" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl">Menu Management</h2>
                  <p className="text-sm text-slate-600">Add, edit, and remove your menu items.</p>
                </div>
                <Button onClick={openCreateMeal}>
                  <Plus className="size-4" />
                  Add Menu Item
                </Button>
              </div>

              {meals.length === 0 ? (
                <Card className="border-dashed">
                  <p className="text-sm text-slate-600">No menu items yet. Create your first meal.</p>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {meals.map((meal) => (
                    <article key={meal.id} className="rounded-xl border border-slate-200 p-4">
                      <h3 className="text-lg">{meal.title ?? meal.name ?? "Untitled Meal"}</h3>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {meal.description ?? "No description provided."}
                      </p>
                      <p className="mt-2 text-sm font-medium text-emerald-700">
                        ${Number(meal.price ?? 0).toFixed(2)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditMeal(meal)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeletingMeal(meal)}>
                          Delete
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        <Dialog open={openMealDialog} onOpenChange={setOpenMealDialog}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{editingMeal ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
              <DialogDescription>Provide details to publish this meal on your provider menu.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                mealForm.handleSubmit().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Failed to save meal"),
                );
              }}
            >
              <mealForm.Field
                name="categoryId"
                validators={{ onChange: ({ value }) => (!value.trim() ? "Category is required" : undefined) }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="field"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={categories.length === 0}
                    >
                      <option value="">{categories.length === 0 ? "No categories found" : "Select category"}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Field
                name="title"
                validators={{ onChange: ({ value }) => (!value.trim() ? "Title is required" : undefined) }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                    {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Field
                name="price"
                validators={{
                  onChange: ({ value }) => {
                    const price = Number(value);
                    if (!value.trim()) return "Price is required";
                    if (!Number.isFinite(price) || price <= 0) return "Price must be greater than 0";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Field name="description">
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Field name="imageUrl">
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Field name="isAvailable">
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Availability</label>
                    <select
                      className="field"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                )}
              </mealForm.Field>

              <mealForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                {({ isSubmitting }) => (
                  <Button className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    {isSubmitting ? "Saving..." : editingMeal ? "Update Menu Item" : "Create Menu Item"}
                  </Button>
                )}
              </mealForm.Subscribe>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(deletingMeal)} onOpenChange={(openState) => !openState && setDeletingMeal(null)}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Delete Menu Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingMeal?.title ?? deletingMeal?.name}&quot;?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingMeal(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMeal}>
                Confirm Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(selectedOrder)} onOpenChange={(openState) => !openState && setSelectedOrder(null)}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Full details for order #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder ? (
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Status:</span> {selectedOrder.status}
                </p>
                <p>
                  <span className="font-medium">Total:</span> ${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Delivery Address:</span> {selectedOrder.deliveryAddress ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Schedule:</span>{" "}
                  {selectedOrder.scheduleType === "LATER"
                    ? `Later (${formatDateTime(selectedOrder.scheduledAt)})`
                    : "Deliver now"}
                </p>
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {selectedOrder.customer?.name ?? "Unknown"}
                  {selectedOrder.customer?.email ? ` (${selectedOrder.customer.email})` : ""}
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Items</p>
                  {(selectedOrder.items ?? []).length === 0 ? (
                    <p className="text-slate-600">No item details available.</p>
                  ) : (
                    (selectedOrder.items ?? []).map((item) => (
                      <div
                        key={item.id ?? item.mealId}
                        className="rounded-lg border border-slate-200 p-2"
                      >
                        <p>{item.meal?.title ?? item.meal?.name ?? "Meal"}</p>
                        <p className="text-xs text-slate-600">
                          Qty: {item.quantity} | Unit: ${Number(item.unitPrice ?? item.meal?.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
