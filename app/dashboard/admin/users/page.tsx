"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { adminService } from "@/services";
import { Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination, Switch } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, formatDate, includesText } from "@/app/dashboard/admin/_shared";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { token, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const list = await adminService.users(token);
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      const status = user.status ?? "ACTIVE";
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (!search.trim()) return true;
      return includesText(user.name, search) || includesText(user.email, search) || includesText(user.id, search);
    });
  }, [roleFilter, search, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ADMIN_PAGE_SIZE));
  const pagedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredUsers, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  async function toggleUserStatus(user: User, active: boolean) {
    if (!token) return;
    try {
      await adminService.updateUserStatus(token, user.id, active ? "ACTIVE" : "SUSPENDED");
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, status: active ? "ACTIVE" : "SUSPENDED" } : item)));
      toast.success(`User ${active ? "activated" : "suspended"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user status");
    }
  }

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Users" description="Manage customer, provider, and admin accounts." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="Search name/email/id" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading users...</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-190 text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Details</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((user) => {
                      const active = user.status !== "SUSPENDED";
                      return (
                        <tr key={user.id} className="border-b">
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.role}</td>
                          <td className="p-2">{user.status ?? "ACTIVE"}</td>
                          <td className="p-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                              View
                            </Button>
                          </td>
                          <td className="p-2">
                            <Switch checked={active} onCheckedChange={(value) => toggleUserStatus(user, value)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2 md:hidden">
                {pagedUsers.map((user) => {
                  const active = user.status !== "SUSPENDED";
                  return (
                    <article key={user.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-slate-600 break-all">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.role} - {user.status ?? "ACTIVE"}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          View
                        </Button>
                        <Switch checked={active} onCheckedChange={(value) => toggleUserStatus(user, value)} />
                      </div>
                    </article>
                  );
                })}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredUsers.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="users"
              />
            </>
          )}
        </Card>

        <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedUser.phone ?? "-"}</p>
                <p><span className="font-medium">Address:</span> {selectedUser.address ?? "-"}</p>
                <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
                <p><span className="font-medium">Status:</span> {selectedUser.status ?? "ACTIVE"}</p>
                <p><span className="font-medium">Joined:</span> {formatDate(selectedUser.createdAt)}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
