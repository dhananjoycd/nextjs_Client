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
