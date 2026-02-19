export type OrderItem = {
  id?: string;
  mealId: string;
  quantity: number;
  unitPrice?: number | string;
  subTotal?: number | string;
  meal?: {
    id: string;
    title?: string;
    name?: string;
    imageUrl?: string;
    price?: number | string;
  };
};

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED"
  | string;

export type Order = {
  id: string;
  status: OrderStatus;
  paymentMethod?: "COD" | "STRIPE" | string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | string;
  totalAmount?: number | string;
  deliveryAddress?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
};
