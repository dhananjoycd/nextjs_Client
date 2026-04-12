import type { User } from "@/types";
import { routes } from "@/lib/routes";

export function getRoleHomePath(role?: User["role"]) {
  if (role === "PROVIDER") return routes.providerDashboard;
  if (role === "ADMIN") return routes.adminDashboard;
  return routes.customerDashboard;
}
