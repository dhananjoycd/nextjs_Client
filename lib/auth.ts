import type { User } from "@/types";
import { routes } from "@/lib/routes";

export function normalizeRole(role?: User["role"]) {
  const value = String(role ?? "")
    .trim()
    .toUpperCase();
  if (value === "ADMIN" || value === "PROVIDER" || value === "CUSTOMER") {
    return value;
  }
  return "CUSTOMER";
}

export function getRoleHomePath(role?: User["role"]) {
  const normalized = normalizeRole(role);
  if (normalized === "PROVIDER") return routes.providerDashboard;
  if (normalized === "ADMIN") return routes.adminDashboard;
  return routes.customerDashboard;
}
