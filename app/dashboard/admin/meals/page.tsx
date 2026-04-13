"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { categoriesService, mealsService } from "@/services";
import { Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, includesText } from "@/app/dashboard/admin/_shared";
import type { Category, Meal } from "@/types";

type MealWithAvailability = Meal & { isAvailable?: boolean };

function mealCategoryName(meal: MealWithAvailability, categories: Category[]) {
  const raw = meal.category;
  if (!raw) return "Uncategorized";
  if (typeof raw === "object") return raw.name ?? raw.id ?? "Uncategorized";
  const value = raw.toLowerCase();
  const match = categories.find((category) =>
    [category.id, category.name, category.slug ?? ""].some((item) => item.toLowerCase() === value),
  );
  return match?.name ?? raw;
}

export default function AdminMealsPage() {
  const { loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<MealWithAvailability[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<MealWithAvailability | null>(null);

  const fetchMeals = useCallback(async () => {
    if (authLoading) return;
    try {
      setLoading(true);
      const [mealList, categoryList] = await Promise.all([
        mealsService.list("limit=300"),
        categoriesService.list(),
      ]);
      setMeals(Array.isArray(mealList) ? mealList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load meals");
      setMeals([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    void fetchMeals();
  }, [fetchMeals]);

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const categoryName = mealCategoryName(meal, categories);
      if (categoryFilter !== "ALL" && categoryName !== categoryFilter) return false;
      if (!search.trim()) return true;
      return (
        includesText(meal.title, search) ||
        includesText(meal.name, search) ||
        includesText(meal.description, search) ||
        includesText(categoryName, search)
      );
    });
  }, [categoryFilter, categories, meals, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMeals.length / ADMIN_PAGE_SIZE));
  const pagedMeals = useMemo(
    () => filteredMeals.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredMeals, page],
  );

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(meals.map((meal) => mealCategoryName(meal, categories))));
  }, [categories, meals]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Meals" description="Monitor all meals across providers." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Search meals/title/category" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="field" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="ALL">All categories</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading meals...</p>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pagedMeals.map((meal) => {
                  const title = meal.title ?? meal.name ?? "Untitled Meal";
                  const available = meal.isAvailable ?? true;
                  return (
                    <article key={meal.id} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-lg font-semibold">{title}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{meal.description ?? "No description"}</p>
                      <p className="mt-2 text-sm font-medium text-emerald-700">${Number(meal.price ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Category: {mealCategoryName(meal, categories)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className={available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}>
                          {available ? "Available" : "Unavailable"}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setSelectedMeal(meal)}>View</Button>
                      </div>
                    </article>
                  );
                })}
                {pagedMeals.length === 0 && <p className="text-sm text-slate-500">No meals found.</p>}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredMeals.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="meals"
              />
            </>
          )}
        </Card>

        <Dialog open={Boolean(selectedMeal)} onOpenChange={(open) => !open && setSelectedMeal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Meal Details</DialogTitle>
            </DialogHeader>
            {selectedMeal ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Title:</span> {selectedMeal.title ?? selectedMeal.name ?? "-"}</p>
                <p><span className="font-medium">Price:</span> ${Number(selectedMeal.price ?? 0).toFixed(2)}</p>
                <p><span className="font-medium">Category:</span> {mealCategoryName(selectedMeal, categories)}</p>
                <p><span className="font-medium">Provider ID:</span> {selectedMeal.providerId ?? selectedMeal.provider?.id ?? "-"}</p>
                <p><span className="font-medium">Description:</span> {selectedMeal.description ?? "-"}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
