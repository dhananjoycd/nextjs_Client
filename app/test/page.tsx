"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

type Meal = {
  id: string;
  name?: string;
  title?: string;
  price?: number;
};

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);

  async function runTest() {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest<Meal[]>("/api/meals");
      setMeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4">
      <h1 className="text-2xl">API Test Page</h1>
      <p className="text-sm text-slate-600">
        Click the button to test `GET /api/meals` using `lib/api.ts`.
      </p>

      <button className="btn btn-primary" onClick={runTest} disabled={loading}>
        {loading ? "Testing..." : "Run API Test"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!error && meals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-teal-700">Success. Loaded {meals.length} meals.</p>
          <ul className="space-y-1 text-sm">
            {meals.slice(0, 5).map((meal) => (
              <li key={meal.id}>
                {meal.name ?? meal.title ?? "Meal"} - ${Number(meal.price ?? 0).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

