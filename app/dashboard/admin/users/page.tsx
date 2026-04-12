import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function AdminUsersPage() {
  redirect(`${routes.adminDashboard}#users`);
}
