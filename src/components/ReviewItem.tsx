import HelpfulButton from "./HelpfulButton";
import { Review } from "@/types/shopify";

interface ReviewItemProps {
    review: Review;
    productId: string;
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

export default function ReviewItem({ review, productId }: ReviewItemProps) {
    return (
        <div
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
    );
}