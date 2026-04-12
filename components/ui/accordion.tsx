"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  value: string[];
  type: "single" | "multiple";
  collapsible: boolean;
  toggleItem: (itemValue: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
};

export function Accordion({
  className,
  type = "single",
  collapsible = false,
  defaultValue,
  value,
  onValueChange,
  ...props
}: AccordionProps) {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(() => {
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === "string") return [defaultValue];
    return [];
  });

  const currentValue = React.useMemo(() => {
    if (!isControlled) {
      return uncontrolledValue;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return [];
  }, [isControlled, uncontrolledValue, value]);

  const setValue = React.useCallback(
    (nextValue: string[]) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(type === "single" ? nextValue[0] ?? "" : nextValue);
    },
    [isControlled, onValueChange, type],
  );

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      setValue((() => {
        const isOpen = currentValue.includes(itemValue);

        if (type === "multiple") {
          return isOpen ? currentValue.filter((value) => value !== itemValue) : [...currentValue, itemValue];
        }

        if (isOpen) {
          return collapsible ? [] : currentValue;
        }

        return [itemValue];
      })());
    },
    [collapsible, currentValue, setValue, type],
  );

  return (
    <AccordionContext.Provider value={{ value: currentValue, type, collapsible, toggleItem }}>
      <div className={cn(className)} {...props} />
    </AccordionContext.Provider>
  );
}

type AccordionItemContextValue = {
  open: boolean;
  itemValue: string;
};

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function AccordionItem({ className, value, ...props }: AccordionItemProps) {
  const accordion = React.useContext(AccordionContext);

  if (!accordion) {
    throw new Error("AccordionItem must be used within Accordion");
  }

  const open = accordion.value.includes(value);

  return (
    <AccordionItemContext.Provider value={{ open, itemValue: value }}>
      <div className={cn("border-b border-slate-200 last:border-b-0", className)} {...props} />
    </AccordionItemContext.Provider>
  );
}

type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function AccordionTrigger({ className, children, onClick, ...props }: AccordionTriggerProps) {
  const accordion = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  return (
    <button
      type="button"
      id={`accordion-trigger-${item.itemValue}`}
      aria-expanded={item.open}
      aria-controls={`accordion-content-${item.itemValue}`}
      className={cn(
        "flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset",
        className,
      )}
      onClick={(event) => {
        accordion.toggleItem(item.itemValue);
        onClick?.(event);
      }}
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl font-semibold leading-none text-slate-700 shadow-sm transition-colors duration-200",
          item.open && "border-emerald-200 bg-emerald-600 text-white shadow-emerald-100",
        )}
      >
        {item.open ? "−" : "+"}
      </span>
    </button>
  );
}

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const item = React.useContext(AccordionItemContext);

  if (!item) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  return (
    <div
      id={`accordion-content-${item.itemValue}`}
      role="region"
      aria-labelledby={`accordion-trigger-${item.itemValue}`}
      hidden={!item.open}
      className={cn("px-4 pb-4 text-sm leading-relaxed text-slate-600", className)}
      {...props}
    >
      {children}
    </div>
  );
}
