"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  Input,
  Separator,
  Textarea,
} from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  clearCart,
  getCartDeliveryFee,
  getCartSubtotal,
  readCartState,
  type CartState,
} from "@/lib/cart";
import { formatMoney, roundMoney } from "@/lib/money";
import { useAuth } from "@/components/AuthProvider";
import { cartService, ordersService, paymentsService } from "@/services";

type OrderAddress = {
  name: string;
  phone: string;
  street: string;
  city: string;
  area: string;
};

type SavedAddress = OrderAddress & {
  id: string;
  label: string;
};

const ADDRESS_KEY = "foodhub_saved_addresses";

function readSavedAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ADDRESS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedAddresses(addresses: SavedAddress[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

function createAddressId() {
  return `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function toDeliveryAddress(value: OrderAddress) {
  return `${value.street}, ${value.area}, ${value.city}`;
}

function toScheduledAt(date: string, time: string) {
  if (!date || !time) return undefined;
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [cartState] = useState<CartState>(() => readCartState());
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => readSavedAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"NOW" | "LATER">("NOW");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [addressForm, setAddressForm] = useState<OrderAddress>({
    name: "",
    phone: "",
    street: "",
    city: "",
    area: "",
  });

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [note, setNote] = useState("");

  const items = cartState.items;
  const subtotal = roundMoney(getCartSubtotal(items));
  const deliveryFee = roundMoney(getCartDeliveryFee(items));
  const discount = 0;
  const total = roundMoney(subtotal + deliveryFee - discount);

  const activeAddress = useMemo(() => {
    if (selectedAddressId) {
      const saved = savedAddresses.find((item) => item.id === selectedAddressId);
      if (saved) {
        return {
          name: saved.name,
          phone: saved.phone,
          street: saved.street,
          city: saved.city,
          area: saved.area,
        } satisfies OrderAddress;
      }
    }

    return addressForm;
  }, [addressForm, savedAddresses, selectedAddressId]);

  function handleAddressChange(field: keyof OrderAddress, value: string) {
    setSelectedAddressId("");
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveAddress() {
    if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.street.trim()) {
      toast.error("Please fill name, phone and street before saving address");
      return;
    }

    const next: SavedAddress = {
      ...addressForm,
      id: createAddressId(),
      label: `${addressForm.area || addressForm.city || "Saved address"}`,
    };

    const updated = [next, ...savedAddresses];
    setSavedAddresses(updated);
    saveSavedAddresses(updated);
    setSelectedAddressId(next.id);
    toast.success("Address saved");
  }

  async function syncLocalCartToServer(authToken: string) {
    const existing = await cartService.get(authToken);

    for (const item of existing.items ?? []) {
      await cartService.remove(authToken, item.id);
    }

    for (const item of items) {
      await cartService.add(authToken, {
        mealId: item.mealId,
        quantity: item.quantity,
      });
    }
  }

  async function placeOrder() {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!token) {
      toast.error("Please login again");
      router.push("/login");
      return;
    }

    if (!activeAddress.name.trim() || !activeAddress.phone.trim() || !activeAddress.street.trim()) {
      toast.error("Please provide name, phone and street");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    if (scheduleType === "LATER" && (!scheduleDate || !scheduleTime)) {
      toast.error("Please select schedule date and time");
      return;
    }

    try {
      setPlacingOrder(true);

      await syncLocalCartToServer(token);

      const deliveryAddress = toDeliveryAddress(activeAddress);
      const selectedScheduleType = scheduleType === "LATER" ? "LATER" : "NOW";
      const scheduledAt = selectedScheduleType === "LATER" ? toScheduledAt(scheduleDate, scheduleTime) : undefined;

      if (paymentMethod === "CARD") {
        const origin = window.location.origin;
        const session = await paymentsService.createStripeCheckoutSession(token, {
          deliveryAddress,
          note: note.trim() || undefined,
          scheduleType: selectedScheduleType,
          scheduledAt,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/cart?payment=cancel`,
        });

        const checkoutUrl = session.checkoutUrl ?? session.url ?? session.sessionUrl;
        if (!checkoutUrl) {
          throw new Error("Failed to initialize Stripe checkout");
        }

        window.location.assign(checkoutUrl);
        return;
      }

      const order = await ordersService.create(token, {
        deliveryAddress,
        note: note.trim() || undefined,
        paymentMethod: "COD",
        scheduleType: selectedScheduleType,
        scheduledAt,
      });

      clearCart();
      toast.success("Order placed successfully");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (items.length === 0) {
    return (
      <Card className="mx-auto mt-8 max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-sm text-slate-600">Add meals before proceeding to checkout.</p>
        <Button onClick={() => router.push("/meals")}>Go to Meals</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <h1 className="text-3xl font-semibold">Checkout</h1>

      <Card className="space-y-4">
        <h2 className="text-xl">1) Address</h2>
        {savedAddresses.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Select saved address</p>
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} name="saved-address">
              {savedAddresses.map((address) => (
                <RadioGroupItem key={address.id} value={address.id}>
                  <div>
                    <p className="font-medium">{address.label}</p>
                    <p className="text-xs text-slate-600">
                      {address.name} | {address.phone} | {address.street}, {address.area}, {address.city}
                    </p>
                  </div>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name" value={addressForm.name} onChange={(e) => handleAddressChange("name", e.target.value)} />
          <Input placeholder="Phone" value={addressForm.phone} onChange={(e) => handleAddressChange("phone", e.target.value)} />
          <Input placeholder="Street" value={addressForm.street} onChange={(e) => handleAddressChange("street", e.target.value)} />
          <Input placeholder="City" value={addressForm.city} onChange={(e) => handleAddressChange("city", e.target.value)} />
          <Input placeholder="Area" value={addressForm.area} onChange={(e) => handleAddressChange("area", e.target.value)} />
        </div>
        <Button variant="outline" onClick={handleSaveAddress}>
          Save this address
        </Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl">2) Schedule</h2>
        <RadioGroup value={scheduleType} onValueChange={(value) => setScheduleType(value as "NOW" | "LATER")} name="schedule">
          <RadioGroupItem value="NOW">Deliver now</RadioGroupItem>
          <RadioGroupItem value="LATER">Schedule later</RadioGroupItem>
        </RadioGroup>
        {scheduleType === "LATER" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl">3) Payment</h2>
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "COD" | "CARD")} name="payment">
          <RadioGroupItem value="COD">Cash on Delivery</RadioGroupItem>
          <RadioGroupItem value="CARD">Card (Stripe Test)</RadioGroupItem>
        </RadioGroup>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl">4) Note</h2>
        <Textarea
          placeholder="Any special instructions for provider"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl">5) Summary</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.mealId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-2">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                <Button asChild variant="ghost" size="sm" className="h-auto px-0 text-xs text-emerald-700 hover:bg-transparent hover:text-emerald-800">
                  <Link href={`/meals/${item.mealId}`}>View details</Link>
                </Button>
              </div>
              <p className="shrink-0 text-sm text-slate-600">
                {item.quantity} x {formatMoney(item.price)}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{items.length}</span>
          </div>
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
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        {paymentMethod === "CARD" && (
          <Alert>
            <AlertTitle>Stripe Checkout</AlertTitle>
            <AlertDescription>
              After you click Place Order, you will be redirected to Stripe to complete payment securely.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Badge>{paymentMethod === "COD" ? "Cash on Delivery" : "Card (Stripe Test)"}</Badge>
          <Badge>{scheduleType === "NOW" ? "Deliver now" : "Scheduled"}</Badge>
        </div>

        <Button className="w-full" onClick={placeOrder} disabled={placingOrder}>
          {placingOrder ? <Loader2 className="size-4 animate-spin" /> : null}
          {placingOrder ? "Placing order..." : "Place Order"}
        </Button>
      </Card>
    </div>
  );
}

