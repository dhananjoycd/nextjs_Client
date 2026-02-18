"use client";

import { Protected } from "@/components/Protected";

export default function AdminPage() {
  return (
    <Protected roles={["ADMIN"]}>
      <div className="card space-y-2">
        <h1 className="text-2xl">Admin Dashboard</h1>
        <p className="text-slate-700">Admin private route is active. Admin module will be built in Task 5.</p>
      </div>
    </Protected>
  );
}

