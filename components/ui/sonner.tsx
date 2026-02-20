"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      offset={16}
      mobileOffset={88}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !border-slate-200 !shadow-lg",
        },
      }}
    />
  );
}
