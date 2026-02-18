"use client";

import { Protected } from "@/components/Protected";

export default function ProviderDashboardPage() {
  return (
    <Protected roles={["PROVIDER"]}>
      <div className="card space-y-2">
        <h1 className="text-2xl">Provider Dashboard</h1>
        <p className="text-slate-700">
          Provider private route is active. Dashboard widgets will be built in Task 4.
        </p>
      </div>
    </Protected>
  );
}

