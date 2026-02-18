"use client";

import { Protected } from "@/components/Protected";

export default function OrdersPage() {
  return (
    <Protected roles={["CUSTOMER"]}>
      <div className="card space-y-2">
        <h1 className="text-2xl">My Orders</h1>
        <p className="text-slate-700">
          Customer private route is active. Order history UI will be built in Task 3.
        </p>
      </div>
    </Protected>
  );
}

