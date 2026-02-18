import type { User } from "@/types";

export function getRoleHomePath(role?: User["role"]) {
  if (role === "PROVIDER") return "/provider/dashboard";
  if (role === "ADMIN") return "/admin";
  return "/meals";
}

