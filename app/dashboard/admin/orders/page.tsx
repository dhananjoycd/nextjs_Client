import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function AdminOrdersPage() {
  redirect(`${routes.adminDashboard}#orders`);
}
