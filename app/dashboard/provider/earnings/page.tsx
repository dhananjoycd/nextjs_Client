import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function ProviderEarningsPage() {
  redirect(`${routes.providerDashboard}#provider-analytics`);
}
