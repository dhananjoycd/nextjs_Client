import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function ProviderOrderDetailsPage() {
  redirect(`${routes.providerDashboard}#incoming-orders`);
}
