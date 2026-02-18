import type { Meal } from "@/lib/types";

export type CartItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
};

const CART_KEY = "foodhub_cart";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addMealToCart(meal: Meal, quantity = 1) {
  const items = getCartItems();
  const name = meal.name ?? meal.title ?? "Meal";
  const existing = items.find((item) => item.mealId === meal.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      mealId: meal.id,
      name,
      price: Number(meal.price ?? 0),
      quantity,
    });
  }
  saveCartItems(items);
}

export function removeCartItem(mealId: string) {
  const items = getCartItems().filter((item) => item.mealId !== mealId);
  saveCartItems(items);
}

export function clearCart() {
  saveCartItems([]);
}

