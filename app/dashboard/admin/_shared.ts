export const ADMIN_NAV_LINKS = [
  { href: "/dashboard/admin", label: "Admin Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/providers", label: "Providers" },
  { href: "/dashboard/admin/meals", label: "Meals" },
  { href: "/dashboard/admin/orders", label: "Orders" },
  { href: "/dashboard/admin/reviews", label: "Reviews" },
  { href: "/dashboard/admin/settings", label: "Settings" },
  { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
  { href: "/dashboard/admin/profile", label: "Profile" },
];

export const ADMIN_PAGE_SIZE = 10;

export function includesText(value: unknown, query: string) {
  return String(value ?? "")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
