import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function NewProviderMealPage() {
  redirect(`${routes.providerDashboard}#menu-management`);
}
