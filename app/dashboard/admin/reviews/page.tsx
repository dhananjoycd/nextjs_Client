"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { useAuth } from "@/components/AuthProvider";
import { apiRequest } from "@/lib/api";
import { Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Pagination } from "@/components/ui";
import { ADMIN_NAV_LINKS, ADMIN_PAGE_SIZE, formatDateTime, includesText } from "@/app/dashboard/admin/_shared";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const { token, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    if (authLoading || !token) return;
    try {
      setLoading(true);
      const data = await apiRequest<Review[]>("/api/v1/reviews", { token, skipAuthHandling: true });
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (ratingFilter !== "ALL" && String(review.rating) !== ratingFilter) return false;
      if (!search.trim()) return true;
      return (
        includesText(review.id, search) ||
        includesText(review.comment, search) ||
        includesText(review.user?.name, search) ||
        includesText(review.mealId, search)
      );
    });
  }, [ratingFilter, reviews, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ADMIN_PAGE_SIZE));
  const pagedReviews = useMemo(
    () => filteredReviews.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filteredReviews, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, ratingFilter]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Reviews" description="Track customer ratings and feedback." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Search review id/comment/user/meal"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="field" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
              <option value="ALL">All ratings</option>
              <option value="5">5 star</option>
              <option value="4">4 star</option>
              <option value="3">3 star</option>
              <option value="2">2 star</option>
              <option value="1">1 star</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Loading reviews...</p>
          ) : (
            <>
              <div className="space-y-2">
                {pagedReviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{review.user?.name ?? "Customer"} - {review.rating}/5</p>
                        <p className="text-sm text-slate-600">Meal: {review.mealId}</p>
                        <p className="text-sm text-slate-700">{review.comment ?? "No comment"}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedReview(review)}>
                        View
                      </Button>
                    </div>
                  </article>
                ))}
                {pagedReviews.length === 0 && <p className="text-sm text-slate-500">No reviews found.</p>}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredReviews.length}
                pageSize={ADMIN_PAGE_SIZE}
                itemLabel="reviews"
              />
            </>
          )}
        </Card>

        <Dialog open={Boolean(selectedReview)} onOpenChange={(open) => !open && setSelectedReview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Review ID:</span> {selectedReview.id}</p>
                <p><span className="font-medium">User:</span> {selectedReview.user?.name ?? selectedReview.userId}</p>
                <p><span className="font-medium">Meal ID:</span> {selectedReview.mealId}</p>
                <p><span className="font-medium">Order ID:</span> {selectedReview.orderId ?? "-"}</p>
                <p><span className="font-medium">Rating:</span> {selectedReview.rating}/5</p>
                <p><span className="font-medium">Comment:</span> {selectedReview.comment ?? "-"}</p>
                <p><span className="font-medium">Created:</span> {formatDateTime(selectedReview.createdAt)}</p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </Protected>
  );
}
