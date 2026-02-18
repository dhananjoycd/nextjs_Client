"use client";

import { Protected } from "@/components/Protected";

export default function ProfilePage() {
  return (
    <Protected roles={["CUSTOMER"]}>
      <div className="card space-y-2">
        <h1 className="text-2xl">Profile</h1>
        <p className="text-slate-700">Customer profile editor will be implemented in Task 3.</p>
      </div>
    </Protected>
  );
}

