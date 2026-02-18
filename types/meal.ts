export type Meal = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  providerId?: string;
  provider?: { id: string; name?: string };
};

