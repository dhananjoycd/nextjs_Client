import { apiRequest } from "@/lib/api";
import type {
  AiMealNaturalSearchResponse,
  AiMealRecommendation,
  AiMealReviewSummary,
  AiSupportChatResponse,
} from "@/types";

type MealRecommendationQuery = {
  mealId?: string;
  limit?: number;
  excludeIds?: string[];
};

type MealNaturalSearchQuery = {
  q: string;
  limit?: number;
};

type MealReviewSummaryQuery = {
  mealId: string;
};

type SupportChatPayload = {
  message: string;
};

function toQueryString(query: MealRecommendationQuery) {
  const params = new URLSearchParams();
  if (query.mealId) params.set("mealId", query.mealId);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.excludeIds && query.excludeIds.length > 0) {
    params.set("excludeIds", query.excludeIds.join(","));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

function toNaturalSearchQueryString(query: MealNaturalSearchQuery) {
  const params = new URLSearchParams();
  params.set("q", query.q);
  if (query.limit) params.set("limit", String(query.limit));
  const search = params.toString();
  return search ? `?${search}` : "";
}

function toReviewSummaryQueryString(query: MealReviewSummaryQuery) {
  const params = new URLSearchParams();
  params.set("mealId", query.mealId);
  const search = params.toString();
  return search ? `?${search}` : "";
}

export const aiService = {
  mealRecommendations(query: MealRecommendationQuery = {}) {
    return apiRequest<AiMealRecommendation[]>(
      `/api/v1/ai/recommendations/meals${toQueryString(query)}`,
    );
  },
  naturalLanguageMealSearch(query: MealNaturalSearchQuery) {
    return apiRequest<AiMealNaturalSearchResponse>(
      `/api/v1/ai/search/meals${toNaturalSearchQueryString(query)}`,
    );
  },
  mealReviewSummary(query: MealReviewSummaryQuery) {
    return apiRequest<AiMealReviewSummary>(
      `/api/v1/ai/reviews/summary${toReviewSummaryQueryString(query)}`,
    );
  },
  supportChat(payload: SupportChatPayload) {
    return apiRequest<AiSupportChatResponse>(`/api/v1/ai/support/chat`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
