export type Meal = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  cuisine?: string | string[];
  dietary?: string | string[];
  dietaryPreferences?: string[];
  tags?: string[];
  price: number;
  imageUrl?: string;
  category?: string | { id?: string; name?: string; slug?: string };
  providerId?: string;
  provider?: { id: string; name?: string };
};
