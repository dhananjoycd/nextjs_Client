"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { config } from "@/lib/config";
import { clearCart, getCartItems } from "@/lib/cart";
import { cartService, ordersService, paymentsService, type ServerCart } from "@/services";

export default function CartPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<ServerCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const paymentToastShown = useRef(false);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.get(token);
      setCart(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (paymentToastShown.current) return;
    if (searchParams.get("payment") !== "cancel") return;
    paymentToastShown.current = true;
    toast.info("Payment was canceled");
  }, [searchParams]);

  const localDraftCount = getCartItems().length;
  const total = useMemo(() => Number(cart?.totalAmount ?? 0), [cart?.totalAmount]);

  const checkoutForm = useForm({
    defaultValues: {
      deliveryAddress: "",
      note: "",
      paymentMethod: "COD",
    },
    onSubmit: async ({ value }) => {
      if (!token) throw new Error("Please login again");
      if (value.paymentMethod === "STRIPE") {
        const origin = window.location.origin;
        const session = await paymentsService.createStripeCheckoutSession(token, {
          deliveryAddress: value.deliveryAddress,
          note: value.note || undefined,
          successUrl: `${origin}/orders?payment=success`,
          cancelUrl: `${origin}/cart?payment=cancel`,
        });
        const checkoutPathOrUrl = session.url ?? session.checkoutUrl ?? session.sessionUrl;
        let checkoutUrl = checkoutPathOrUrl;
        if (checkoutPathOrUrl?.startsWith("/")) {
          checkoutUrl = `${config.apiBaseUrl}${checkoutPathOrUrl}`;
        } else if (
          checkoutPathOrUrl &&
          !checkoutPathOrUrl.startsWith("http://") &&
          !checkoutPathOrUrl.startsWith("https://")
        ) {
          checkoutUrl = `${config.apiBaseUrl}/${checkoutPathOrUrl.replace(/^\/+/, "")}`;
        }
        if (!checkoutUrl) throw new Error("Failed to initialize Stripe checkout");
        window.location.assign(checkoutUrl);
        return;
      }

      const order = await ordersService.create(token, {
        deliveryAddress: value.deliveryAddress,
        note: value.note || undefined,
        paymentMethod: "COD",
      });
      toast.success("Order placed successfully (Cash on Delivery)");
      checkoutForm.reset();
      await fetchCart();
      window.location.assign(`/orders/${order.id}`);
    },
  });

  async function syncLocalCartToServer() {
    if (!token) return;
    const localItems = getCartItems();
    if (localItems.length === 0) return;
    try {
      setSyncing(true);
      for (const item of localItems) {
        await cartService.add(token, { mealId: item.mealId, quantity: item.quantity });
      }
      clearCart();
      toast.success("Local cart synced");
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync cart");
    } finally {
      setSyncing(false);
    }
  }

  async function updateQuantity(id: string, quantity: number) {
    if (!token) return;
    try {
      await cartService.update(token, id, quantity);
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update quantity");
    }
  }

  async function removeItem(id: string) {
    if (!token) return;
    try {
      await cartService.remove(token, id);
      toast.info("Item removed from cart");
      await fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    }
  }

  const items = cart?.items ?? [];

  return (
    <Protected roles={["CUSTOMER"]}>
      <DashboardShell
        title="My Cart"
        description="Manage your cart and complete checkout."
        links={[
          { href: "/cart", label: "Cart", active: true },
          { href: "/orders", label: "Orders" },
          { href: "/profile", label: "Profile" },
        ]}
      >
        {localDraftCount > 0 && (
          <Card>
            <Button variant="outline" onClick={syncLocalCartToServer} disabled={syncing}>
              {syncing ? <Loader2 className="size-4 animate-spin" /> : null}
              {syncing ? "Syncing..." : `Sync local cart (${localDraftCount})`}
            </Button>
          </Card>
        )}
        {loading ? (
          <Card>Loading cart...</Card>
        ) : items.length === 0 ? (
          <Card className="space-y-3 text-center">
            <ShoppingCart className="mx-auto size-8 text-slate-400" />
            <p className="text-slate-600">Your cart is empty right now.</p>
            <Button asChild>
              <Link href="/meals">Browse meals</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <Card className="space-y-3">
              {items.map((item) => {
                const mealName = item.meal.title ?? item.meal.name ?? "Meal";
                const unitPrice = Number(item.meal.price ?? 0);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium">{mealName}</p>
                      <p className="text-sm text-slate-600">${unitPrice.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="status-pill">{item.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xl">Checkout</h2>
              <p className="text-sm text-slate-600">Total amount</p>
              <p className="text-3xl font-semibold text-emerald-700">${total.toFixed(2)}</p>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  checkoutForm.handleSubmit().catch((error) =>
                    toast.error(error instanceof Error ? error.message : "Failed to place order"),
                  );
                }}
              >
                <checkoutForm.Field
                  name="deliveryAddress"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim().length < 5 ? "Delivery address must be at least 5 characters" : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Delivery Address</label>
                      <Input
                        placeholder="House 12, Road 4, Dhanmondi"
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-xs text-rose-600">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </checkoutForm.Field>

                <checkoutForm.Field name="note">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Note (optional)</label>
                      <Textarea
                        placeholder="Call me before delivery"
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                    </div>
                  )}
                </checkoutForm.Field>

                <checkoutForm.Field name="paymentMethod">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Payment Method</label>
                      <select
                        className="field"
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value)}
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="STRIPE">Stripe (Card Payment)</option>
                      </select>
                    </div>
                  )}
                </checkoutForm.Field>

                <checkoutForm.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
                  {({ isSubmitting }) => (
                    <Button className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                      {isSubmitting ? "Placing Order..." : "Place Order"}
                    </Button>
                  )}
                </checkoutForm.Subscribe>
              </form>
            </Card>
          </div>
        )}
      </DashboardShell>
    </Protected>
  );
}
