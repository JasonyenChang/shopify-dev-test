"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface AddReviewButtonProps {
    productId: string;
}

export default function AddReviewButton({ productId }: AddReviewButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleAddReview = () => {
        startTransition(async () => {
            try {
                const fakeReview = {
                    rating: 2,
                    text: "Not good.",
                    userName: "Lucy",
                    userId: "5",
                };

                const res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        review: fakeReview,
                    }),
                });

                if (!res.ok) throw new Error("API Error");

                router.refresh();

            } catch (error) {
                console.error(error);
                alert("Failed to add a review.");
            }
        });
    };

    return (
        <button
            onClick={handleAddReview}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isPending ? "Please wait..." : "Add Review"}
        </button>
    );
}