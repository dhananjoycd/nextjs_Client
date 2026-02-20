"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Pagination,
  Switch,
  Textarea,
} from "@/components/ui";
import { adminService, categoriesService, ordersService } from "@/services";
import type { Category, Order, User } from "@/types";

const PAGE_SIZE = 10;
const LIVE_REFRESH_MS = 20_000;

function includesText(value: unknown, query: string) {
  return String(value ?? "").toLowerCase().includes(query.toLowerCase());
}

function getOrderProviders(order: Order) {
  const names = new Set<string>();

  for (const item of order.items ?? []) {
    const mealRecord = item.meal as
      | {
          provider?: { name?: string };
        }
      | undefined;

    const providerName = mealRecord?.provider?.name?.trim();
    if (providerName) {
      names.add(providerName);
    }
  }

  if (names.size === 0) return "Unknown provider";
  return Array.from(names).join(", ");
}

function getOrderProviderDetails(order: Order) {
  const providers = new Map<string, { id: string; name: string }>();

  for (const item of order.items ?? []) {
    const provider = item.meal?.provider;
    if (!provider) continue;
    const id = provider.id?.trim();
    const name = provider.name?.trim();
    if (!id || !name) continue;
    providers.set(id, { id, name });
  }

  return Array.from(providers.values());
}

function getOrderCustomer(order: Order) {
  const customerName = order.customer?.name?.trim();
  const customerEmail = order.customer?.email?.trim();
  if (customerName && customerEmail) return `${customerName} (${customerEmail})`;
  if (customerName) return customerName;
  if (customerEmail) return customerEmail;
  return "Unknown customer";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrderForProviders, setSelectedOrderForProviders] = useState<Order | null>(null);
  const [selectedOrderForCustomer, setSelectedOrderForCustomer] = useState<Order | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [userPage, setUserPage] = useState(1);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderPage, setOrderPage] = useState(1);

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      const [userList, orderList, categoryList] = await Promise.all([
        adminService.users(token),
        ordersService.list(token),
        categoriesService.list(),
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      setOrders(Array.isArray(orderList) ? orderList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load admin data");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => {
      void fetchData(true);
    }, LIVE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchData, token]);

  const stats = useMemo(
    () => {
      const activeUsers = users.filter((user) => (user.status ?? "ACTIVE") === "ACTIVE");
      const activeCustomers = activeUsers.filter((user) => user.role === "CUSTOMER").length;
      const activeProviders = activeUsers.filter((user) => user.role === "PROVIDER").length;
      const suspendedUsers = users.filter((user) => user.status === "SUSPENDED").length;

      const liveOrders = orders.filter((order) =>
        ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status),
      ).length;
      const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");
      const todayKey = new Date().toDateString();
      const deliveredToday = deliveredOrders.filter((order) => {
        if (!order.createdAt) return false;
        const date = new Date(order.createdAt);
        return !Number.isNaN(date.getTime()) && date.toDateString() === todayKey;
      }).length;
      const grossRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

      return [
        { label: "Total Users", value: users.length.toString() },
        { label: "Active Customers", value: activeCustomers.toString() },
        { label: "Active Providers", value: activeProviders.toString() },
        { label: "Suspended Users", value: suspendedUsers.toString() },
        { label: "Total Orders", value: orders.length.toString() },
        { label: "Live Orders", value: liveOrders.toString() },
        { label: "Delivered Today", value: deliveredToday.toString() },
        { label: "Gross Revenue", value: `$${grossRevenue.toFixed(2)}` },
        { label: "Categories", value: categories.length.toString() },
      ];
    },
    [categories.length, orders, users],
  );

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      await fetchData(true);
    } finally {
      setRefreshing(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (userRoleFilter !== "ALL" && user.role !== userRoleFilter) return false;
      const status = user.status ?? "ACTIVE";
      if (userStatusFilter !== "ALL" && status !== userStatusFilter) return false;
      if (!userSearch) return true;
      return includesText(user.name, userSearch) || includesText(user.email, userSearch) || includesText(user.id, userSearch);
    });
  }, [userRoleFilter, userSearch, userStatusFilter, users]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderStatusFilter !== "ALL" && order.status !== orderStatusFilter) return false;
      if (!orderSearch) return true;
      return (
        includesText(order.id, orderSearch) ||
        includesText(order.deliveryAddress, orderSearch) ||
        includesText(order.note, orderSearch) ||
        includesText(order.customer?.name, orderSearch) ||
        includesText(order.customer?.email, orderSearch)
      );
    });
  }, [orderSearch, orderStatusFilter, orders]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (!categorySearch) return true;
      return includesText(category.name, categorySearch) || includesText(category.description, categorySearch);
    });
  }, [categories, categorySearch]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter]);

  useEffect(() => {
    setCategoryPage(1);
  }, [categorySearch]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const totalCategoryPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));

  useEffect(() => {
    setUserPage((prev) => Math.min(prev, totalUserPages));
  }, [totalUserPages]);

  useEffect(() => {
    setOrderPage((prev) => Math.min(prev, totalOrderPages));
  }, [totalOrderPages]);

  useEffect(() => {
    setCategoryPage((prev) => Math.min(prev, totalCategoryPages));
  }, [totalCategoryPages]);

  const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);
  const pagedOrders = filteredOrders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE);
  const pagedCategories = filteredCategories.slice((categoryPage - 1) * PAGE_SIZE, categoryPage * PAGE_SIZE);

  const categoryForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) throw new Error("Please login again");

      if (editingCategory) {
        await categoriesService.update(token, editingCategory.id, value);
        toast.success("Category updated");
      } else {
        await categoriesService.create(token, value);
        toast.success("Category created");
      }

      categoryForm.reset();
      setOpenCategory(false);
      setEditingCategory(null);
      await fetchData();
    },
  });

  useEffect(() => {
    if (!openCategory) return;
    if (editingCategory) {
      categoryForm.reset({
        name: editingCategory.name ?? "",
        description: editingCategory.description ?? "",
      });
      return;
    }
    categoryForm.reset({ name: "", description: "" });
  }, [categoryForm, editingCategory, openCategory]);

  async function toggleUserStatus(user: User, active: boolean) {
    if (!token) return;
    try {
      await adminService.updateUserStatus(token, user.id, active ? "ACTIVE" : "SUSPENDED");
      toast.success(`User ${active ? "activated" : "suspended"}`);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  }

  function openCreateCategory() {
    setEditingCategory(null);
    categoryForm.reset({ name: "", description: "" });
    setOpenCategory(true);
  }

  function openEditCategory(category: Category) {
    setEditingCategory(category);
    setOpenCategory(true);
  }

  async function confirmDeleteCategory() {
    if (!token || !deletingCategory) return;

    try {
      await categoriesService.remove(token, deletingCategory.id);
      toast.success("Category deleted");
      setDeletingCategory(null);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  }

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell
        title="Admin Dashboard"
        description="Monitor users, orders, and categories."
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin#analytics", label: "Analytics" },
          { href: "/admin#users", label: "Users" },
          { href: "/admin#orders", label: "Orders" },
          { href: "/admin#categories", label: "Categories" },
        ]}
      >
        {loading ? (
          <Card>Loading admin dashboard...</Card>
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

            <div id="analytics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="space-y-1 border-sky-100">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-semibold text-sky-700">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card id="users" className="space-y-3">
              <h2 className="text-xl">Users</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input placeholder="Search name/email/id" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                <select className="field" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                  <option value="ALL">All roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select className="field" value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                  <option value="ALL">All status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div className="space-y-2 md:hidden">
                {pagedUsers.map((user) => {
                  const isActive = user.status !== "SUSPENDED";
                  return (
                    <article key={user.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-600 break-all">{user.email}</p>
                        <p className="text-xs text-slate-500">Status: {user.status ?? "ACTIVE"}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          View Details
                        </Button>
                        <Switch checked={isActive} onCheckedChange={(value) => toggleUserStatus(user, value)} />
                      </div>
                    </article>
                  );
                })}
                {pagedUsers.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">No users found.</p>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Details</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((user) => {
                      const isActive = user.status !== "SUSPENDED";
                      return (
                        <tr key={user.id} className="border-b">
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                              View
                            </Button>
                          </td>
                          <td className="p-2">{user.status ?? "ACTIVE"}</td>
                          <td className="p-2">
                            <Switch checked={isActive} onCheckedChange={(value) => toggleUserStatus(user, value)} />
                          </td>
                        </tr>
                      );
                    })}
                    {pagedUsers.length === 0 && (
                      <tr>
                        <td className="p-2 text-slate-500" colSpan={5}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={userPage}
                totalPages={totalUserPages}
                onPageChange={setUserPage}
                totalItems={filteredUsers.length}
                pageSize={PAGE_SIZE}
                itemLabel="users"
              />
            </Card>

            <Card id="orders" className="space-y-3">
              <h2 className="text-xl">Orders Overview</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Search order/customer/address/note"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                <select className="field" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                  <option value="ALL">All status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>
              <div className="space-y-2 md:hidden">
                {pagedOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="space-y-1">
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-slate-600">Status: {order.status}</p>
                      <p className="text-sm text-emerald-700">${Number(order.totalAmount ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrderForCustomer(order)}>
                        Customer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrderForProviders(order)}>
                        Provider
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrderForDetails(order)}>
                        Details
                      </Button>
                    </div>
                  </article>
                ))}
                {pagedOrders.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">No orders found.</p>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-2">Order</th>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Provider</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Order Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2">#{order.id.slice(0, 8)}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrderForCustomer(order)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrderForProviders(order)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">${Number(order.totalAmount ?? 0).toFixed(2)}</td>
                        <td className="p-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrderForDetails(order)}>
                            See Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pagedOrders.length === 0 && (
                      <tr>
                        <td className="p-2 text-slate-500" colSpan={6}>
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={orderPage}
                totalPages={totalOrderPages}
                onPageChange={setOrderPage}
                totalItems={filteredOrders.length}
                pageSize={PAGE_SIZE}
                itemLabel="orders"
              />
            </Card>

            <Card id="categories" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl">Category Management</h2>
                <Button onClick={openCreateCategory}>
                  <Plus className="size-4" /> Add Category
                </Button>
              </div>
              <Input
                placeholder="Search category name/description"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              <div className="grid gap-3 md:grid-cols-2">
                {pagedCategories.map((category) => (
                  <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-slate-600">{category.description ?? "No description"}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditCategory(category)}>
                        <Pencil className="size-4" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeletingCategory(category)}>
                        <Trash2 className="size-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {pagedCategories.length === 0 && <p className="text-sm text-slate-500">No categories found.</p>}
              </div>
              <Pagination
                page={categoryPage}
                totalPages={totalCategoryPages}
                onPageChange={setCategoryPage}
                totalItems={filteredCategories.length}
                pageSize={PAGE_SIZE}
                itemLabel="categories"
              />
            </Card>
          </>
        )}

        <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information for this user account.</DialogDescription>
            </DialogHeader>
            {selectedUser ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {selectedUser.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {selectedUser.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {selectedUser.phone ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {selectedUser.address ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Role:</span> {selectedUser.role}
                </p>
                <p>
                  <span className="font-medium">Joined:</span> {formatDate(selectedUser.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {selectedUser.status ?? "ACTIVE"}
                </p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedOrderForCustomer)}
          onOpenChange={(open) => !open && setSelectedOrderForCustomer(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>Customer information associated with this order.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              {selectedOrderForCustomer ? (
                <>
                  <p>
                    <span className="font-medium">Name:</span> {selectedOrderForCustomer.customer?.name ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedOrderForCustomer.customer?.email ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Customer ID:</span> {selectedOrderForCustomer.customer?.id ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Delivery Address:</span>{" "}
                    {selectedOrderForCustomer.deliveryAddress ?? "-"}
                  </p>
                </>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedOrderForProviders)}
          onOpenChange={(open) => !open && setSelectedOrderForProviders(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provider Details</DialogTitle>
              <DialogDescription>Providers associated with this order.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              {selectedOrderForProviders ? (
                getOrderProviderDetails(selectedOrderForProviders).length > 0 ? (
                  getOrderProviderDetails(selectedOrderForProviders).map((provider) => (
                    <div key={provider.id} className="rounded-lg border border-slate-200 p-2">
                      <p>
                        <span className="font-medium">Name:</span> {provider.name}
                      </p>
                      <p>
                        <span className="font-medium">Provider ID:</span> {provider.id}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No provider details available.</p>
                )
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedOrderForDetails)}
          onOpenChange={(open) => !open && setSelectedOrderForDetails(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Detailed information for this order.</DialogDescription>
            </DialogHeader>
            {selectedOrderForDetails ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Order ID:</span> {selectedOrderForDetails.id}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {selectedOrderForDetails.status}
                </p>
                <p>
                  <span className="font-medium">Total:</span> $
                  {Number(selectedOrderForDetails.totalAmount ?? 0).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {selectedOrderForDetails.deliveryAddress ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Schedule:</span>{" "}
                  {selectedOrderForDetails.scheduleType === "LATER"
                    ? `Later (${formatDateTime(selectedOrderForDetails.scheduledAt)})`
                    : "Deliver now"}
                </p>
                <p>
                  <span className="font-medium">Note:</span> {selectedOrderForDetails.note ?? "-"}
                </p>
                <p>
                  <span className="font-medium">Created:</span> {formatDate(selectedOrderForDetails.createdAt)}
                </p>
                <div className="space-y-1">
                  <p className="font-medium">Items</p>
                  {(selectedOrderForDetails.items ?? []).length === 0 ? (
                    <p className="text-slate-600">No item details available.</p>
                  ) : (
                    (selectedOrderForDetails.items ?? []).map((item) => (
                      <div key={item.id ?? item.mealId} className="rounded-lg border border-slate-200 p-2">
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

        <Dialog
          open={openCategory}
          onOpenChange={(nextOpen) => {
            setOpenCategory(nextOpen);
            if (!nextOpen) {
              setEditingCategory(null);
              categoryForm.reset({ name: "", description: "" });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Update Category" : "Create Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update this category for provider menus."
                  : "Add a new meal category for providers."}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                categoryForm.handleSubmit().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Failed to save category"),
                );
              }}
            >
              <categoryForm.Field
                name="name"
                validators={{ onChange: ({ value }) => (!value ? "Name is required" : undefined) }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                    {field.state.meta.errors[0] && <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>}
                  </div>
                )}
              </categoryForm.Field>
              <categoryForm.Field name="description">
                {(field) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
                  </div>
                )}
              </categoryForm.Field>
              <categoryForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                {({ isSubmitting }) => (
                  <Button className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                    {isSubmitting
                      ? editingCategory
                        ? "Updating..."
                        : "Creating..."
                      : editingCategory
                        ? "Update Category"
                        : "Create Category"}
                  </Button>
                )}
              </categoryForm.Subscribe>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => !open && setDeletingCategory(null)}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingCategory?.name}"?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingCategory(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteCategory}>
                Confirm Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
