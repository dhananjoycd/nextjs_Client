import type { Meal } from "@/types/meal";
import type { User } from "@/types/user";

export type Provider = {
  id: string;
  name?: string;
  bio?: string;
  cuisine?: string;
  user?: User;
  meals?: Meal[];
};

