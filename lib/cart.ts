import type { Meal } from "@/types";

export type CartItem = {
  mealId: string;
  providerId: string;
  providerName: string;
  providerDeliveryFee: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  tags: string[];
};

export type CartState = {
  items: CartItem[];
  lastAddedProviderId: string | null;
};

const CART_KEY = "foodhub_cart_state";
const CART_EVENT = "foodhub:cart-updated";
const DEFAULT_DELIVERY_FEE = 60;

const isBrowser = () => typeof window !== "undefined";

function normalizeTag(value: unknown): string {
  return String(value ?? "").trim();
}

function toTagList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => toTagList(entry));
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return [normalizeTag(record.name)];
    if (typeof record.label === "string") return [normalizeTag(record.label)];
    return [];
  }

  const normalized = normalizeTag(value);
  return normalized ? [normalized] : [];
}

function mealTitle(meal: Meal): string {
  return meal.name ?? meal.title ?? "Meal";
}

function resolveProviderId(meal: Meal): string {
  return meal.provider?.id ?? meal.providerId ?? "unknown-provider";
}

function resolveProviderName(meal: Meal): string {
  return meal.provider?.name ?? "Provider";
}

function resolveProviderDeliveryFee(meal: Meal): number {
  const raw = meal.provider?.deliveryFee;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return raw;
  }

  return DEFAULT_DELIVERY_FEE;
}

function resolveTags(meal: Meal): string[] {
  const values = [
    ...toTagList(meal.tags),
    ...toTagList(meal.cuisine),
    ...toTagList(meal.dietary),
    ...toTagList(meal.dietaryPreferences),
  ];

  const unique = new Set(values.map((value) => value.trim()).filter(Boolean));
  return Array.from(unique).slice(0, 3);
}

function emitCartChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function readCartState(): CartState {
  if (!isBrowser()) {
    return { items: [], lastAddedProviderId: null };
  }

  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) {
    return { items: [], lastAddedProviderId: null };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const lastAddedProviderId = typeof parsed.lastAddedProviderId === "string" ? parsed.lastAddedProviderId : null;
    return { items, lastAddedProviderId };
  } catch {
    return { items: [], lastAddedProviderId: null };
  }
}

export function saveCartState(state: CartState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(state));
  emitCartChanged();
}

export function getCartItems(): CartItem[] {
  return readCartState().items;
}

export function addMealToCart(meal: Meal, quantity = 1): CartState {
  const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  const state = readCartState();
  const items = [...state.items];

  const nextItem: CartItem = {
    mealId: meal.id,
    providerId: resolveProviderId(meal),
    providerName: resolveProviderName(meal),
    providerDeliveryFee: resolveProviderDeliveryFee(meal),
    name: mealTitle(meal),
    price: Number(meal.price ?? 0),
    quantity: safeQty,
    imageUrl: meal.imageUrl,
    tags: resolveTags(meal),
  };

  const existing = items.find((item) => item.mealId === nextItem.mealId);
  if (existing) {
    existing.quantity += safeQty;
    existing.providerId = nextItem.providerId;
    existing.providerName = nextItem.providerName;
    existing.providerDeliveryFee = nextItem.providerDeliveryFee;
    existing.tags = nextItem.tags;
  } else {
    items.push(nextItem);
  }

  const nextState: CartState = {
    items,
    lastAddedProviderId: nextItem.providerId,
  };

  saveCartState(nextState);
  return nextState;
}

export function updateCartItemQuantity(mealId: string, nextQuantity: number): CartState {
  const state = readCartState();
  const items = state.items.map((item) => {
    if (item.mealId !== mealId) return item;
    return {
      ...item,
      quantity: Math.max(1, Math.floor(nextQuantity)),
    };
  });

  const nextState: CartState = {
    ...state,
    items,
  };
  saveCartState(nextState);
  return nextState;
}

export function incrementCartItem(mealId: string): CartState {
  const item = getCartItems().find((entry) => entry.mealId === mealId);
  if (!item) return readCartState();
  return updateCartItemQuantity(mealId, item.quantity + 1);
}

export function decrementCartItem(mealId: string): CartState {
  const item = getCartItems().find((entry) => entry.mealId === mealId);
  if (!item) return readCartState();
  return updateCartItemQuantity(mealId, Math.max(1, item.quantity - 1));
}

export function removeCartItem(mealId: string): CartState {
  const state = readCartState();
  const items = state.items.filter((item) => item.mealId !== mealId);
  const lastAddedProviderId = items.some((item) => item.providerId === state.lastAddedProviderId)
    ? state.lastAddedProviderId
    : items[0]?.providerId ?? null;

  const nextState: CartState = {
    items,
    lastAddedProviderId,
  };
  saveCartState(nextState);
  return nextState;
}

export function clearCart(): CartState {
  const nextState: CartState = { items: [], lastAddedProviderId: null };
  saveCartState(nextState);
  return nextState;
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartDeliveryFee(items: CartItem[]): number {
  const providerFees = new Map<string, number>();
  for (const item of items) {
    if (!providerFees.has(item.providerId)) {
      providerFees.set(item.providerId, item.providerDeliveryFee);
    }
  }

  return Array.from(providerFees.values()).reduce((sum, fee) => sum + fee, 0);
}

export function getPrimaryProviderId(state: CartState): string | null {
  if (state.lastAddedProviderId) return state.lastAddedProviderId;
  return state.items[0]?.providerId ?? null;
}

export function hasMultipleProviders(items: CartItem[]): boolean {
  return new Set(items.map((item) => item.providerId)).size > 1;
}

export function subscribeToCartChange(listener: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handler = () => listener();
  window.addEventListener(CART_EVENT, handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
  };
}
