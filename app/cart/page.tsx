"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  Separator,
} from "@/components/ui";
import { apiRequest } from "@/lib/api";
import {
  addMealToCart,
  clearCart,
  decrementCartItem,
  getCartDeliveryFee,
  getCartSubtotal,
  getPrimaryProviderId,
  hasMultipleProviders,
  incrementCartItem,
  readCartState,
  removeCartItem,
  subscribeToCartChange,
  type CartItem,
  type CartState,
} from "@/lib/cart";
import { formatMoney, roundMoney } from "@/lib/money";
import type { Meal } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<CartState>({ items: [], lastAddedProviderId: null });
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);

  const syncCart = useCallback(() => {
    setState(readCartState());
  }, []);

  useEffect(() => {
    syncCart();
    const unsubscribe = subscribeToCartChange(syncCart);
    return unsubscribe;
  }, [syncCart]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingMeals(true);
        const data = await apiRequest<Meal[]>("/api/v1/meals");
        if (!active) return;
        setAllMeals(Array.isArray(data) ? data : []);
      } catch {
        if (!active) return;
        setAllMeals([]);
      } finally {
        if (active) setLoadingMeals(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const items = state.items;
  const subtotal = roundMoney(getCartSubtotal(items));
  const deliveryFee = roundMoney(getCartDeliveryFee(items));
  const discount = 0;
  const total = roundMoney(subtotal + deliveryFee - discount);
  const primaryProviderId = getPrimaryProviderId(state);
  const multiProvider = hasMultipleProviders(items);

  const cartMealIds = useMemo(() => new Set(items.map((item) => item.mealId)), [items]);

  const moreFromProvider = useMemo(() => {
    if (!primaryProviderId) return [] as Meal[];

    return allMeals.filter((meal) => {
      const providerId = meal.provider?.id ?? meal.providerId;
      if (!providerId || providerId !== primaryProviderId) return false;
      if (cartMealIds.has(meal.id)) return false;
      return true;
    });
  }, [allMeals, cartMealIds, primaryProviderId]);

  function handleQuickAdd(meal: Meal) {
    addMealToCart(meal, 1);
    toast.success("Added to cart");
  }

  function handleProceedCheckout() {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!user) {
      toast.error("Please login as customer to continue checkout");
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customer accounts can place orders");
      return;
    }

    router.push("/checkout");
  }

  function renderCartItem(item: CartItem) {
    return (
      <Card key={item.mealId} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100"
            style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="truncate text-sm text-slate-600">{item.providerName}</p>
            <p className="text-sm text-emerald-700">{formatMoney(item.price)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => decrementCartItem(item.mealId)} aria-label="Decrease quantity">
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
          <Button size="icon" variant="outline" onClick={() => incrementCartItem(item.mealId)} aria-label="Increase quantity">
            <Plus className="size-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => removeCartItem(item.mealId)} aria-label="Remove item">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 py-8">
        <Card className="mx-auto max-w-xl space-y-4 border-dashed text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ShoppingCart className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="text-sm text-slate-600">Looks like you have not added any meals yet.</p>
          <Button asChild>
            <Link href="/meals">Browse meals</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Your Cart</h1>
            <Button variant="ghost" onClick={() => clearCart()}>
              Clear cart
            </Button>
          </div>

          {user?.role && user.role !== "CUSTOMER" && (
            <Alert variant="warning">
              <AlertTitle>Ordering is customer-only</AlertTitle>
              <AlertDescription>
                You are logged in as {user.role}. Use a customer account to place orders.
              </AlertDescription>
            </Alert>
          )}

          {multiProvider && (
            <Alert variant="warning">
              <AlertTitle>Multiple providers in cart</AlertTitle>
              <AlertDescription>
                Your cart has items from multiple providers. You may need to place separate orders.
              </AlertDescription>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={() => toast.info("Split by provider is a UI stub for now")}
              >
                Split by provider
              </Button>
            </Alert>
          )}

          <div className="space-y-3">{items.map(renderCartItem)}</div>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">More from this provider</h2>
              {primaryProviderId ? <Badge>{items.find((item) => item.providerId === primaryProviderId)?.providerName}</Badge> : null}
            </div>
            {loadingMeals ? (
              <p className="text-sm text-slate-600">Loading recommendations...</p>
            ) : moreFromProvider.length === 0 ? (
              <p className="text-sm text-slate-600">No additional meals found for this provider.</p>
            ) : (
              <div className="grid auto-cols-[220px] grid-flow-col gap-3 overflow-x-auto pb-1">
                {moreFromProvider.map((meal) => (
                  <Card key={meal.id} className="space-y-2 p-3">
                    <div
                      className="h-24 rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
                      style={meal.imageUrl ? { backgroundImage: `url(${meal.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                    />
                    <p className="line-clamp-1 font-medium">{meal.name ?? meal.title ?? "Meal"}</p>
                    <p className="text-xs text-slate-500">{meal.provider?.name ?? "Provider"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-700">{formatMoney(Number(meal.price ?? 0))}</span>
                      <Button size="sm" onClick={() => handleQuickAdd(meal)}>
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="hidden lg:block">
          <Card className="sticky top-24 space-y-3">
            <h2 className="text-xl">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fee</span>
                <span>{formatMoney(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span>{formatMoney(discount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleProceedCheckout}>
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-semibold text-emerald-700">{formatMoney(total)}</p>
          </div>
          <Button onClick={handleProceedCheckout}>Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
}
