"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";

const POPUP_SEEN_KEY = "foodhub_feature_popup_seen_v1";

const QUICK_FEATURES = [
  "Customer: browse meals, add to cart, and place orders quickly.",
  "Provider: manage menu, track incoming orders, and view earnings.",
  "Admin: monitor users, orders, reviews, and platform settings.",
  "Smart search and responsive experience across mobile and desktop.",
];

export function OneTimeFeaturePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(POPUP_SEEN_KEY);
    if (seen) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  function markSeen() {
    window.localStorage.setItem(POPUP_SEEN_KEY, "true");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          markSeen();
        }
      }}
    >
      <DialogContent className="w-[94vw] max-w-md p-5 sm:p-6" aria-describedby="feature-popup-description">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl">Welcome to FoodHub</DialogTitle>
          <DialogDescription id="feature-popup-description" className="text-sm leading-relaxed">
            Quick highlights of what you can do here.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {QUICK_FEATURES.map((item) => (
            <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full"
            onClick={() => {
              markSeen();
              setOpen(false);
            }}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
