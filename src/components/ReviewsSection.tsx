"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Review } from "@/types/shopify";
// import HelpfulButton from "./HelpfulButton";

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
        return "Just now";
    }
}

export default function ReviewsSection({ productId, initialReviews }: ReviewsSectionProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // For optimistic UI. Insert the latest review into the list and display it to the user immediately.
    const [optimisticReviews, addOptimisticReview] = useOptimistic(
        initialReviews,
        (state, newReview: Review) => [newReview, ...state]
    );

    const handleAddReview = () => {
        const tempId = crypto.randomUUID();

        let currentUser = null;
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    currentUser = JSON.parse(userStr);
                } catch (e) {
                    console.error("User data parse error", e);
                }
            }
        }

        // Mock optimistic data
        const optimisticReview: Review = {
            id: tempId,
            productId: productId,
            rating: 5,
            text: `Optimistic UI 測試！(立刻出現，背景存檔) - ${new Date().toLocaleTimeString()}`,
            userName: currentUser ? currentUser.name : "Anonymous",
            userId: currentUser ? currentUser.id : undefined,
            helpfulCount: 0,
            createdAt: new Date().toISOString(),
        };

        startTransition(async () => {
            // Update UI immediately.
            addOptimisticReview(optimisticReview);

            try {
                // Add a new review
                const res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        review: {
                            rating: optimisticReview.rating,
                            text: optimisticReview.text,
                            userName: optimisticReview.userName,
                            userId: optimisticReview.userId,
                        },
                    }),
                });

                if (!res.ok) throw new Error("API Error");

                // Inform page.tsx to request api again
                router.refresh();
            } catch (error) {
                console.error("Failed to insert a new review: ", error);
            }
        });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Reviews ({optimisticReviews.length})</h2>
                </div>

                <button
                    onClick={handleAddReview}
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
                >
                    {isPending ? "Saving..." : "＋ Add Instant Review"}
                </button>
            </div>

            <hr className="border-gray-100 mb-8" />

            {optimisticReviews.length > 0 ? (
                <div className="space-y-8">
                    {optimisticReviews.map((review) => (
                        <div
                            key={review.id}
                            className={`border-b border-gray-100 pb-8 last:border-0 last:pb-0 ${review.id.length > 20 ? "animate-pulse opacity-70" : ""
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900">{review.userName}</span>
                                        {review.userId && (
                                            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Verified Purchase</span>
                                        )}
                                    </div>
                                    <div className="flex text-yellow-400 text-sm">
                                        {"★".repeat(review.rating)}
                                        <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                            </div>

                            <div className="mt-3 text-gray-700 leading-relaxed">{review.text}</div>

                            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Was this helpful?</span>
                                    {/* <HelpfulButton
                                        productId={productId}
                                        reviewId={review.id}
                                        initialCount={review.helpfulCount || 0}
                                    /> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No reviews yet.</p>
                </div>
            )}
        </div>
    );
}