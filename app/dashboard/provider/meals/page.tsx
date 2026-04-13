"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import { Badge, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { categoriesService } from "@/services";
import type { Category, Meal } from "@/types";

const PROVIDER_NAV_LINKS = [
  { href: "/dashboard/provider", label: "Dashboard" },
  { href: "/dashboard/provider/meals", label: "Manage Meals" },
  { href: "/dashboard/provider/orders", label: "Order Queue" },
  { href: "/dashboard/provider/earnings", label: "Earnings" },
  { href: "/dashboard/provider/profile", label: "Business Profile" },
];

type ProviderMeal = Meal & { isAvailable?: boolean };

type MealFormState = {
  categoryId: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: string;
};

const EMPTY_FORM: MealFormState = {
  categoryId: "",
  title: "",
  description: "",
  price: "",
  imageUrl: "",
  isAvailable: "true",
};

function resolveMealCategoryId(meal: ProviderMeal, categories: Category[]) {
  const raw = meal.category;
  if (!raw) return "";
  if (typeof raw === "object" && raw.id) return raw.id;
  const value = String(typeof raw === "string" ? raw : raw.name ?? raw.slug ?? "").toLowerCase();
  const match = categories.find(
    (category) =>
      category.id.toLowerCase() === value ||
      category.name.toLowerCase() === value ||
      (category.slug ?? "").toLowerCase() === value,
  );
  return match?.id ?? "";
}

export default function ManageMealsPage() {
  const { token, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<ProviderMeal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<ProviderMeal | null>(null);
  const [savingMeal, setSavingMeal] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState("");
  const [mealForm, setMealForm] = useState<MealFormState>(EMPTY_FORM);

  const applyMealToForm = useCallback(
    (meal: ProviderMeal | null) => {
      if (!meal) {
        setMealForm(EMPTY_FORM);
        return;
      }

      setMealForm({
        categoryId: resolveMealCategoryId(meal, categories),
        title: meal.title ?? meal.name ?? "",
        description: meal.description ?? "",
        price: Number(meal.price ?? 0) > 0 ? String(meal.price) : "",
        imageUrl: meal.imageUrl ?? "",
        isAvailable: String(meal.isAvailable ?? true),
      });
    },
    [categories],
  );

  const fetchMeals = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const mealEndpoints = [
        { url: "/api/v1/meals/my", skipAuthHandling: false },
        { url: "/api/v1/meals?limit=200", skipAuthHandling: true },
        { url: "/api/v1/meals", skipAuthHandling: true },
      ];
      let data: ProviderMeal[] = [];
      for (const endpoint of mealEndpoints) {
        try {
          const result = await apiRequest<ProviderMeal[]>(endpoint.url, {
            token,
            skipAuthHandling: endpoint.skipAuthHandling,
          });
          data = Array.isArray(result) ? result : [];
          break;
        } catch {
          continue;
        }
      }
      setMeals(data);
    } catch (error) {
      toast.error("Failed to load meals");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  const fetchCategories = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      const list = await categoriesService.list(token);
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchMeals();
  }, [fetchMeals]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  function openCreateMeal() {
    setEditingMeal(null);
    setMealForm(EMPTY_FORM);
    setOpenMealDialog(true);
  }

  function openEditMeal(meal: ProviderMeal) {
    setEditingMeal(meal);
    applyMealToForm(meal);
    setOpenMealDialog(true);
  }

  async function submitMealForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const payload = {
      categoryId: mealForm.categoryId.trim(),
      title: mealForm.title.trim(),
      description: mealForm.description.trim() || undefined,
      price: Number(mealForm.price),
      imageUrl: mealForm.imageUrl.trim() || undefined,
      isAvailable: mealForm.isAvailable === "true",
    };

    if (!payload.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!payload.title) {
      toast.error("Title is required");
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setSavingMeal(true);
      if (editingMeal) {
        await apiRequest(`/api/v1/meals/${editingMeal.id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
        toast.success("Meal updated");
      } else {
        await apiRequest("/api/v1/meals", {
          method: "POST",
          token,
          body: JSON.stringify(payload),
        });
        toast.success("Meal created");
      }

      setOpenMealDialog(false);
      setEditingMeal(null);
      setMealForm(EMPTY_FORM);
      await fetchMeals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save meal");
    } finally {
      setSavingMeal(false);
    }
  }

  async function deleteMeal(mealId: string) {
    if (!token) return;
    try {
      setDeletingMealId(mealId);
      await apiRequest(`/api/v1/meals/${mealId}`, { method: "DELETE", token });
      toast.success("Meal deleted");
      await fetchMeals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete meal");
    } finally {
      setDeletingMealId("");
    }
  }

  return (
    <Protected roles={["PROVIDER"]}>
      <DashboardShell
        title="Manage Meals"
        description="Add, edit, or remove meals from your menu"
        links={PROVIDER_NAV_LINKS}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button className="gap-2" onClick={openCreateMeal}>
              <Plus className="size-4" />
              Add Meal
            </Button>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">Loading meals...</p>
            </Card>
          ) : meals.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-600">No meals yet. Create one to get started!</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meals.map((meal) => (
                <Card key={meal.id} className="overflow-hidden p-4">
                  <h3 className="font-semibold text-slate-900">{meal.name || meal.title}</h3>
                  <p className="text-sm text-slate-600">${Number(meal.price || 0).toFixed(2)}</p>
                  <Badge
                    className={meal.isAvailable ? "mt-2 border-emerald-200 bg-emerald-50 text-emerald-700" : "mt-2 border-slate-200 bg-slate-100 text-slate-600"}
                  >
                    {meal.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditMeal(meal)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const confirmed = window.confirm("Are you sure you want to delete this meal?");
                        if (confirmed) {
                          void deleteMeal(meal.id);
                        }
                      }}
                      disabled={deletingMealId === meal.id}
                    >
                      {deletingMealId === meal.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={openMealDialog} onOpenChange={setOpenMealDialog}>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>{editingMeal ? "Edit Meal" : "Add Meal"}</DialogTitle>
              </DialogHeader>
              <form className="space-y-3" onSubmit={submitMealForm}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="field"
                    value={mealForm.categoryId}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    disabled={categories.length === 0}
                  >
                    <option value="">{categories.length === 0 ? "No categories found" : "Select category"}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={mealForm.title}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={mealForm.price}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, price: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={mealForm.description}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={mealForm.imageUrl}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Availability</label>
                  <select
                    className="field"
                    value={mealForm.isAvailable}
                    onChange={(event) => setMealForm((prev) => ({ ...prev, isAvailable: event.target.value }))}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenMealDialog(false);
                      setEditingMeal(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingMeal}>
                    {savingMeal ? "Saving..." : editingMeal ? "Update Meal" : "Create Meal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardShell>
    </Protected>
  );
}
