import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function EditProviderMealPage() {
  redirect(`${routes.providerDashboard}#menu-management`);
}
