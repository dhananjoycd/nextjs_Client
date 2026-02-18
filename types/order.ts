export type OrderItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderStatus =
  | "PLACED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED"
  | string;

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount?: number;
  createdAt?: string;
  items?: OrderItem[];
};

