"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { adminService, categoriesService, ordersService } from "@/services";
import { Card, Input, Pagination } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, formatDateTime, includesText } from "@/app/dashboard/admin/_shared";

type AuditItem = {
  id: string;
  type: "USER" | "ORDER" | "CATEGORY";
  title: string;
  details: string;
  timestamp?: string;
};

export default function AdminAuditLogsPage() {
  const { token, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const [users, orders, categories] = await Promise.all([
        adminService.users(token),
        ordersService.list(token),
        categoriesService.list(),
      ]);

      const userLogs: AuditItem[] = (Array.isArray(users) ? users : []).map((user) => ({
        id: `user-${user.id}`,
        type: "USER",
        title: `User ${user.status === "SUSPENDED" ? "Suspended" : "Active"}`,
        details: `${user.name} (${user.email}) - ${user.role}`,
        timestamp: user.createdAt,
      }));

      const orderLogs: AuditItem[] = (Array.isArray(orders) ? orders : []).map((order) => ({
        id: `order-${order.id}`,
        type: "ORDER",
        title: `Order ${order.status}`,
        details: `#${order.id.slice(0, 8)} - ${order.customer?.name ?? "Unknown"} - $${Number(order.totalAmount ?? 0).toFixed(2)}`,
        timestamp: order.updatedAt ?? order.createdAt,
      }));

      const categoryLogs: AuditItem[] = (Array.isArray(categories) ? categories : []).map((category) => ({
        id: `category-${category.id}`,
        type: "CATEGORY",
        title: "Category Available",
        details: `${category.name} (${category.slug ?? "no-slug"})`,
      }));

      const merged = [...orderLogs, ...userLogs, ...categoryLogs].sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      });

      setLogs(merged);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
      if (!search.trim()) return true;
      return includesText(item.title, search) || includesText(item.details, search) || includesText(item.id, search);
    });
  }, [logs, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ADMIN_PAGE_SIZE));
  const pagedLogs = useMemo(
    () => filteredLogs.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredLogs, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Audit Logs" description="Review recent platform activities." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Search logs" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="field" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="ALL">All event types</option>
              <option value="USER">User</option>
              <option value="ORDER">Order</option>
              <option value="CATEGORY">Category</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading audit logs...</p>
          ) : (
            <>
              <div className="space-y-2">
                {pagedLogs.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.details}</p>
                        <p className="text-xs text-slate-500">Event: {item.type}</p>
                      </div>
                      <p className="text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
                    </div>
                  </article>
                ))}
                {pagedLogs.length === 0 && <p className="text-sm text-slate-500">No logs found.</p>}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredLogs.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="logs"
              />
            </>
          )}
        </Card>
      </DashboardShell>
    </Protected>
  );
}
