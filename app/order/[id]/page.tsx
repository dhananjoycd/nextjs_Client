"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function OrderRedirectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (!params.id) return;
    router.replace(routes.customerOrderDetails(params.id));
  }, [params.id, router]);

  return <p className="py-10 text-center text-sm text-slate-600">Opening order details...</p>;
}
