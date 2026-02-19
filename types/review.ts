export type Review = {
  id: string;
  userId: string;
  mealId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  user?: {
    id?: string;
    name?: string;
  };
  createdAt?: string;
};
