export type AiRecommendationSignal =
  | "personal_history"
  | "similar_meal"
  | "popular_pick"
  | "budget_match";

export type AiAssistantMeta = {
  source: "gemini" | "local";
  label: "Rayna GV2.5" | "Rayna LV1.1";
  model: string;
};

export type AiSearchSignal =
  | "text_match"
  | "budget_match"
  | "premium_match"
  | "personalized_match";

export type AiMealRecommendation = {
  id: string;
  title: string;
  description?: string;
  dietary?: string[];
  imageUrl?: string;
  price: number;
  rating: number;
  reviewCount: number;
  score: number;
  signal: AiRecommendationSignal;
  reason: string;
  provider: {
    id: string;
    name?: string;
  };
  category: {
    id: string;
    name?: string;
    slug?: string;
  };
};

export type AiMealSearchResult = {
  id: string;
  title: string;
  description?: string;
  dietary?: string[];
  imageUrl?: string;
  price: number;
  rating: number;
  reviewCount: number;
  score: number;
  signal: AiSearchSignal;
  reason: string;
  matchTerms: string[];
  provider: {
    id: string;
    name?: string;
  };
  category: {
    id: string;
    name?: string;
    slug?: string;
  };
};

export type AiMealSearchInterpretation = {
  terms: string[];
  minPrice: number | null;
  maxPrice: number | null;
  intents: {
    budget: boolean;
    premium: boolean;
    healthy: boolean;
    spicy: boolean;
    sweet: boolean;
    proteinRich: boolean;
  };
};

export type AiMealNaturalSearchResponse = {
  assistant: AiAssistantMeta;
  query: string;
  interpreted: AiMealSearchInterpretation;
  data: AiMealSearchResult[];
};

export type AiMealRecommendationResponse = {
  assistant: AiAssistantMeta;
  items: AiMealRecommendation[];
};

export type AiMealReviewTheme = {
  label: string;
  mentions: number;
  sentiment: "positive" | "negative";
};

export type AiMealReviewSummary = {
  assistant: AiAssistantMeta;
  mealId: string;
  mealTitle: string;
  reviewCount: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  summary: string;
  highlights: string[];
  concerns: string[];
  themes: AiMealReviewTheme[];
  recommendation: string;
  meal: {
    id: string;
    title: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt?: string;
    customer?: {
      id?: string;
      name?: string;
    };
  }>;
};

export type AiSupportChatResponse = {
  reply: string;
  intent: string;
  suggestions: string[];
  escalate: boolean;
  assistant: AiAssistantMeta;
};
