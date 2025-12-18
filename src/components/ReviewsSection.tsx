
"use client";

import { useOptimistic, useTransition, useState, useMemo } from "react";
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

const REVIEWS_PER_PAGE = 10;
type SortOption = 'recent' | 'helpful';

export default function ReviewsSection({ productId, initialReviews }: ReviewsSectionProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
    const [sortBy, setSortBy] = useState<SortOption>('recent');

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
            setSortBy('recent');

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

    const sortedReviews = useMemo(() => {
        return [...optimisticReviews].sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
                return (b.helpfulCount || 0) - (a.helpfulCount || 0);
            }
        });
    }, [optimisticReviews, sortBy]);

    const displayedReviews = sortedReviews.slice(0, visibleCount);
    const hasMore = visibleCount < sortedReviews.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
    };

    return (
        <div>
            <Toaster />
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6 border-b border-gray-100 pb-8">
                    {/* Left Side: Title & Summary */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

                        {optimisticReviews.length > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">{averageRating}</span>
                                    <div className="flex flex-col">
                                        <div className="flex text-yellow-400 text-lg tracking-tight">
                                            {"★".repeat(Math.round(Number(averageRating)))}
                                            <span className="text-gray-200">
                                                {"★".repeat(5 - Math.round(Number(averageRating)))}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium mt-0.5">
                                            Based on {reviewCount} reviews
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                        {/* Sort Dropdown */}
                        {optimisticReviews.length > 0 && (
                            <div className="relative group">
                                <select
                                    id="sort-reviews"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="w-full md:w-40 appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="helpful">Most Helpful</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Write Review Button */}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm border ${showForm
                                ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                : "bg-black border-transparent text-white hover:bg-gray-800 hover:shadow-md"
                                }`}
                        >
                            {showForm ? "Cancel" : "Write a Review"}
                        </button>
                    </div>
                </div>

                {/* Review form */}
                {showForm && (
                    <div>
                        <ReviewForm
                            onSubmit={handleReviewSubmit}
                            isSubmitting={isPending}
                        />
                    </div>
                )}

                {/* Review list */}
                {displayedReviews.length > 0 ? (
                    <div className="space-y-8">
                        {displayedReviews.map((review) => (
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

                        {/* Load more */}
                        {hasMore && (
                            <div className="pt-4 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Load More Reviews
                                </button>
                            </div>
                        )}
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

