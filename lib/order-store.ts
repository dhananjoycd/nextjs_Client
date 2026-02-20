import { createId } from "@/lib/ids";
import { roundMoney } from "@/lib/money";
import type { CartItem } from "@/types/cart";

export type TrackingStatus =
  | "CONFIRMED"
  | "PREPARING"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "DELIVERED";

export type DeliverySchedule =
  | { type: "NOW" }
  | {
      type: "LATER";
      date: string;
      time: string;
    };

export type OrderAddress = {
  name: string;
  phone: string;
  street: string;
  city: string;
  area: string;
};

export type StoredOrder = {
  id: string;
  items: CartItem[];
  providers: Array<{
    id: string;
    name: string;
    deliveryFee: number;
  }>;
  address: OrderAddress;
  paymentMethod: "COD" | "CARD";
  schedule: DeliverySchedule;
  note?: string;
  createdAt: string;
  etaMinutes: number;
  status: TrackingStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export type CreateOrderInput = {
  items: CartItem[];
  address: OrderAddress;
  paymentMethod: "COD" | "CARD";
  schedule: DeliverySchedule;
  note?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
};

const ORDER_KEY = "foodhub_orders";

function isBrowser() {
  return typeof window !== "undefined";
}

function readOrders(): StoredOrder[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(ORDER_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: StoredOrder[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function deriveProviders(items: CartItem[]) {
  const map = new Map<string, { id: string; name: string; deliveryFee: number }>();

  for (const item of items) {
    if (!map.has(item.providerId)) {
      map.set(item.providerId, {
        id: item.providerId,
        name: item.providerName,
        deliveryFee: item.providerDeliveryFee,
      });
    }
  }

  return Array.from(map.values());
}

export function createMockOrder(input: CreateOrderInput): StoredOrder {
  const createdAt = new Date().toISOString();
  const etaMinutes = input.schedule.type === "NOW" ? 35 : 55;

  return {
    id: createId("ord"),
    items: input.items,
    providers: deriveProviders(input.items),
    address: input.address,
    paymentMethod: input.paymentMethod,
    schedule: input.schedule,
    note: input.note,
    createdAt,
    etaMinutes,
    status: "CONFIRMED",
    subtotal: roundMoney(input.subtotal),
    deliveryFee: roundMoney(input.deliveryFee),
    discount: roundMoney(input.discount),
    total: roundMoney(input.subtotal + input.deliveryFee - input.discount),
  };
}

export function saveOrder(order: StoredOrder) {
  const orders = readOrders();
  saveOrders([order, ...orders.filter((entry) => entry.id !== order.id)]);
}

export function getOrderById(id: string): StoredOrder | null {
  return readOrders().find((order) => order.id === id) ?? null;
}

export function updateOrderStatus(id: string, status: TrackingStatus): StoredOrder | null {
  const orders = readOrders();
  let updated: StoredOrder | null = null;

  const next = orders.map((order) => {
    if (order.id !== id) return order;
    updated = { ...order, status };
    return updated;
  });

  if (updated) {
    saveOrders(next);
  }

  return updated;
}
