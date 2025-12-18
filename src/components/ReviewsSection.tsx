"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Review } from "@/types/shopify";
import ReviewForm, { ReviewFormData } from "./ReviewForm";
import toast, { Toaster } from "react-hot-toast";
import HelpfulButton from "./HelpfulButton";

interface ReviewsSectionProps {
    productId: string;
    initialReviews: Review[];
}

function formatDate(dateString: string) {
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        console.log("unknown formatDate", e)
        return "Just now";
    }
}

export default function ReviewsSection({ productId, initialReviews }: ReviewsSectionProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);

    // For optimistic UI. Insert the latest review into the list and display it to the user immediately.
    const [optimisticReviews, addOptimisticReview] = useOptimistic(
        initialReviews,
        (state, newReview: Review) => [newReview, ...state]
    );

    const handleReviewSubmit = (formData: ReviewFormData) => {
        const tempId = crypto.randomUUID();

        // Optimistic Data
        const optimisticReview: Review = {
            id: tempId,
            productId: productId,
            rating: formData.rating as 1 | 2 | 3 | 4 | 5,
            text: formData.text,
            userName: formData.name,
            userId: formData.userId,
            helpfulCount: 0,
            createdAt: new Date().toISOString(),
        };

        startTransition(async () => {
            // Display new review immediately
            addOptimisticReview(optimisticReview);

            try {
                // Add a new review
                const res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        review: optimisticReview,
                    }),
                });

                if (!res.ok) throw new Error("API Error");

                //  Inform page.tsx to request api again
                router.refresh();
                setShowForm(false);
                toast.success("Review submitted successfully!", {
                    duration: 3000,
                    position: "top-center",
                    style: {
                        background: "#333",
                        color: "#fff",
                    },
                });
            } catch (error) {
                console.error("Submission failed", error);
                toast.error("Failed to submit. Please try again.", {
                    duration: 3000,
                    position: "top-center",
                });
            }
        });
    };

    const reviewCount = optimisticReviews.length;
    const averageRating = reviewCount > 0
        ? (optimisticReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
        : "0.0";

    return (
        <div>
            <Toaster />
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-bold">Customer Reviews</h2>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="text-blue-600 font-medium hover:underline transition-colors"
                            >
                                {showForm ? "Cancel" : "Write a Review"}
                            </button>
                        </div>

                        {optimisticReviews.length > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
                                <div className="flex flex-col">
                                    <div className="flex text-yellow-400 text-lg">
                                        {"★".repeat(Math.round(Number(averageRating)))}
                                        <span className="text-gray-300">
                                            {"★".repeat(5 - Math.round(Number(averageRating)))}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">Based on {reviewCount} reviews</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review form */}
                {showForm && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <ReviewForm
                            onSubmit={handleReviewSubmit}
                            isSubmitting={isPending}
                        />
                    </div>
                )}

                <hr className="border-gray-100 mb-8" />

                {/* Review list */}
                {optimisticReviews.length > 0 ? (
                    <div className="space-y-8">
                        {optimisticReviews.map((review) => (
                            <div
                                key={review.id}
                                className={`border-b border-gray-100 pb-8 last:border-0 last:pb-0 ${review.id.length > 20 ? "opacity-70" : ""
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    {/* User info and rating */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{review.userName}</span>
                                            {review.userId && (
                                                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {"★".repeat(review.rating)}
                                            <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                                        </div>
                                    </div>
                                    {/* Date */}
                                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                                </div>

                                {/* Review text */}
                                <div className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {review.text}
                                </div>

                                {/* Helpful */}
                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Was this helpful?</span>
                                        <HelpfulButton
                                            productId={productId}
                                            reviewId={review.id}
                                            initialCount={review.helpfulCount || 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-900 font-medium">No reviews yet</p>
                        <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                    </div>
                )}

            </div>
        </div>
    );
}