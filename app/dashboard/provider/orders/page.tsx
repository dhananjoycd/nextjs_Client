import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function ProviderOrdersPage() {
  redirect(`${routes.providerDashboard}#incoming-orders`);
}
