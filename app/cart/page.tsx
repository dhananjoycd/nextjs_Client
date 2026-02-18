"use client";

import { Protected } from "@/components/Protected";

export default function CartPage() {
  return (
    <Protected roles={["CUSTOMER"]}>
      <div className="card space-y-2">
        <h1 className="text-2xl">Cart</h1>
        <p className="text-slate-700">Customer private route is active. Cart features come in Task 3.</p>
      </div>
    </Protected>
  );
}

