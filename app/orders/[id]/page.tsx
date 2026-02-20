"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { Badge, Button, Card, Textarea } from "@/components/ui";
import { ordersService, reviewsService } from "@/services";
import type { Order } from "@/types";

const steps = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const LIVE_REFRESH_MS = 5_000;

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (status === "CANCELED") return "bg-rose-50 text-rose-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-700";
  return "bg-sky-50 text-sky-700";
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [reviewingMealId, setReviewingMealId] = useState("");
  const [submittedMealIds, setSubmittedMealIds] = useState<Record<string, true>>({});
  const lastStatusRef = useRef<string>("");

  const fetchDetails = useCallback(async (silent = false) => {
    if (!token || !params.id) return;
    try {
      if (!silent) setLoading(true);
      const data = await ordersService.details(token, params.id);
      if (silent && lastStatusRef.current && lastStatusRef.current !== data.status) {
        toast.success(`Order status updated: ${data.status}`);
      }
      lastStatusRef.current = data.status;
      setOrder(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load order");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!token || !params.id) return;
    const timer = window.setInterval(() => {
      void fetchDetails(true);
    }, LIVE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [fetchDetails, params.id, token]);

  async function refreshDetails() {
    try {
      setRefreshing(true);
      await fetchDetails(true);
    } finally {
      setRefreshing(false);
    }
  }

  const currentStep = useMemo(() => {
    if (!order) return -1;
    return steps.indexOf(order.status);
  }, [order]);

  const canReview = order?.status === "DELIVERED";

  async function submitReview(mealId: string) {
    if (!token || !order) return;
    const rating = reviewRatings[mealId] ?? 0;
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    try {
      setReviewingMealId(mealId);
      await reviewsService.create(token, {
        mealId,
        rating,
        comment: reviewComments[mealId]?.trim() || undefined,
        orderId: order.id,
      });
      setSubmittedMealIds((prev) => ({ ...prev, [mealId]: true }));
      toast.success("Review submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setReviewingMealId("");
    }
  }

  return (
    <Protected roles={["CUSTOMER"]}>
      <div className="space-y-4">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl">Order Details</h1>
            <p className="text-sm text-slate-600">Order id: {params.id}</p>
            <p className="text-xs text-slate-500">
              Live refresh every {LIVE_REFRESH_MS / 1000}s
              {lastUpdated ? ` - Last update ${lastUpdated}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshDetails} disabled={refreshing}>
              {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/orders">Back to orders</Link>
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card>Loading order...</Card>
        ) : !order ? (
          <Card>Order not found.</Card>
        ) : (
          <>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Current Status</p>
                <Badge className={statusClass(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Schedule:{" "}
                {order.scheduleType === "LATER"
                  ? `Later (${formatDateTime(order.scheduledAt)})`
                  : "Deliver now"}
              </p>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isComplete = currentStep >= index;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      ) : (
                        <Circle className="size-5 text-slate-300" />
                      )}
                      <p className={isComplete ? "text-slate-900" : "text-slate-500"}>{step}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="space-y-2">
              <h2 className="text-xl">Items</h2>
              {(order.items ?? []).map((item) => (
                <div key={item.id ?? item.mealId} className="space-y-3 rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p>{item.meal?.title ?? item.meal?.name ?? "Meal"}</p>
                    <p className="text-sm text-slate-600">
                      {item.quantity} x ${Number(item.unitPrice ?? item.meal?.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                  {canReview && item.mealId && (
                    <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium">Leave a review</p>
                      {submittedMealIds[item.mealId] ? (
                        <p className="text-sm text-emerald-700">Review submitted for this meal.</p>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="text-sm text-slate-700">Rating</label>
                            <select
                              className="field max-w-[140px]"
                              value={String(reviewRatings[item.mealId] ?? "")}
                              onChange={(event) =>
                                setReviewRatings((prev) => ({
                                  ...prev,
                                  [item.mealId]: Number(event.target.value),
                                }))
                              }
                            >
                              <option value="">Select</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                            </select>
                          </div>
                          <Textarea
                            placeholder="Write your feedback (optional)"
                            value={reviewComments[item.mealId] ?? ""}
                            onChange={(event) =>
                              setReviewComments((prev) => ({
                                ...prev,
                                [item.mealId]: event.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            onClick={() => submitReview(item.mealId)}
                            disabled={reviewingMealId === item.mealId}
                          >
                            {reviewingMealId === item.mealId ? "Submitting..." : "Submit Review"}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </Protected>
  );
}
