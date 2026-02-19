import { apiRequest } from "@/lib/api";
import type { Review } from "@/types";

type CreateReviewPayload = {
  mealId: string;
  rating: number;
  comment?: string;
  orderId?: string;
};

export const reviewsService = {
  create(token: string, payload: CreateReviewPayload) {
    return apiRequest<Review>("/api/v1/reviews", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
};

