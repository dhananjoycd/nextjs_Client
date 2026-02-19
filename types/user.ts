import type { Meal } from "@/types/meal";

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN" | string;

export type UserStatus = "ACTIVE" | "SUSPENDED" | string;

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
  phone?: string;
  address?: string;
  image?: string;
  createdAt?: string;
  meals?: Meal[];
};
