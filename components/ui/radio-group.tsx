"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RadioGroupContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  className?: string;
  children: React.ReactNode;
};

export function RadioGroup({ value, onValueChange, name, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div className={cn("grid gap-2", className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = {
  value: string;
  className?: string;
  children: React.ReactNode;
};

export function RadioGroupItem({ value, className, children }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup");
  }

  const checked = context.value === value;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        checked ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white",
        className,
      )}
    >
      <input
        type="radio"
        name={context.name}
        value={value}
        checked={checked}
        onChange={() => context.onValueChange(value)}
        className="mt-0.5"
      />
      <span>{children}</span>
    </label>
  );
}
