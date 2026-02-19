"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Plus } from "lucide-react";
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
  Switch,
  Textarea,
} from "@/components/ui";
import { adminService, categoriesService, ordersService } from "@/services";
import type { Category, Order, User } from "@/types";

export default function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [userList, orderList, categoryList] = await Promise.all([
        adminService.users(token),
        ordersService.list(token),
        categoriesService.list(),
      ]);
      setUsers(Array.isArray(userList) ? userList : []);
      setOrders(Array.isArray(orderList) ? orderList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const stats = useMemo(
    () => [
      { label: "Users", value: users.length.toString() },
      { label: "Orders", value: orders.length.toString() },
      { label: "Categories", value: categories.length.toString() },
    ],
    [categories.length, orders.length, users.length],
  );

  const categoryForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) throw new Error("Please login again");
      await categoriesService.create(token, value);
      toast.success("Category created");
      categoryForm.reset();
      setOpenCategory(false);
      await fetchData();
    },
  });

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

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell
        title="Admin Dashboard"
        description="Monitor users, orders, and categories."
        links={[{ href: "/admin", label: "Overview", active: true }]}
      >
        {loading ? (
          <Card>Loading admin dashboard...</Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="space-y-1 border-sky-100">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-semibold text-sky-700">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card className="space-y-3">
              <h2 className="text-xl">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isActive = user.status !== "SUSPENDED";
                      return (
                        <tr key={user.id} className="border-b">
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <Badge>{user.role}</Badge>
                          </td>
                          <td className="p-2">{user.status ?? "ACTIVE"}</td>
                          <td className="p-2">
                            <Switch checked={isActive} onCheckedChange={(value) => toggleUserStatus(user, value)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-xl">Orders Overview</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-2">Order</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2">#{order.id.slice(0, 8)}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">${Number(order.totalAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Category Management</h2>
                <Button onClick={() => setOpenCategory(true)}>
                  <Plus className="size-4" /> Add Category
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-slate-600">{category.description ?? "No description"}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        <Dialog open={openCategory} onOpenChange={setOpenCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>Add a new meal category for providers.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                categoryForm.handleSubmit().catch((error) =>
                  toast.error(error instanceof Error ? error.message : "Failed to create category"),
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
                    {isSubmitting ? "Creating..." : "Create Category"}
                  </Button>
                )}
              </categoryForm.Subscribe>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
