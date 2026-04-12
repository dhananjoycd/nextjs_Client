import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function ProviderMealsPage() {
  redirect(`${routes.providerDashboard}#menu-management`);
}
