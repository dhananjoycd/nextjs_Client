"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "CANCELED") return "bg-rose-50 text-rose-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
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

export default function ProviderDashboardPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<ProviderMeal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ProviderMeal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<ProviderMeal | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      setLoading(true);
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
      setStatusDrafts(
        normalizedOrders.reduce<Record<string, string>>((acc, order) => {
          acc[order.id] = order.status;
          return acc;
        }, {}),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load provider dashboard");
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const inProgress = orders.filter((order) =>
      ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status),
    ).length;
    return [
      { label: "Menu Items", value: meals.length.toString() },
      { label: "Incoming Orders", value: orders.length.toString() },
      { label: "Pending Orders", value: pending.toString() },
      { label: "In Progress", value: inProgress.toString() },
    ];
  }, [meals.length, orders]);

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
    mealForm.reset({
      categoryId: resolveMealCategoryId(meal, categories),
      title: meal.title ?? meal.name ?? "",
      description: meal.description ?? "",
      price: String(meal.price ?? ""),
      imageUrl: meal.imageUrl ?? "",
      isAvailable: String(meal.isAvailable ?? true),
    });
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

  async function updateOrderStatus(orderId: string) {
    if (!token) return;
    const nextStatus = statusDrafts[orderId];
    if (!nextStatus) return;
    try {
      setUpdatingOrderId(orderId);
      await apiRequest(`/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success("Order status updated");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdatingOrderId("");
    }
  }

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Provider Dashboard"
        description="Manage menu items, incoming orders, and delivery pipeline."
        links={[{ href: "/provider/dashboard", label: "Overview", active: true }]}
      >
        {loading ? (
          <Card>Loading dashboard...</Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="space-y-1 border-emerald-100">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-semibold text-emerald-700">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl">Incoming Orders</h2>
                  <p className="text-sm text-slate-600">Review each order and move it through delivery stages.</p>
                </div>
                <Button variant="outline" onClick={refreshDashboard} disabled={refreshing}>
                  {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  Refresh
                </Button>
              </div>

              {orders.length === 0 ? (
                <Card className="border-dashed">
                  <p className="text-sm text-slate-600">No incoming orders.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <article key={order.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600">
                            Total ${Number(order.totalAmount ?? 0).toFixed(2)} - {order.items?.length ?? 0} items
                          </p>
                        </div>
                        <Badge className={statusClass(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <div className="min-w-[220px] space-y-1">
                          <label className="text-xs uppercase tracking-[0.08em] text-slate-500">Next Status</label>
                          <select
                            className="field h-10"
                            value={statusDrafts[order.id] ?? order.status}
                            onChange={(event) =>
                              setStatusDrafts((prev) => ({
                                ...prev,
                                [order.id]: event.target.value,
                              }))
                            }
                          >
                            {ORDER_STATUS_OPTIONS.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          onClick={() => updateOrderStatus(order.id)}
                          disabled={
                            updatingOrderId === order.id ||
                            (statusDrafts[order.id] ?? order.status) === order.status
                          }
                        >
                          {updatingOrderId === order.id ? "Updating..." : "Update Status"}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-4">
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
      </DashboardShell>
    </Protected>
  );
}
