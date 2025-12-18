"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface HelpfulButtonProps {
    productId: string;
    reviewId: string;
    initialCount: number;
}

export default function HelpfulButton({
    productId,
    reviewId,
    initialCount,
}: HelpfulButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [count, setCount] = useState(initialCount);
    const [hasClicked, setHasClicked] = useState(false);

    const handleHelpful = () => {
        if (isPending || hasClicked) return;

        // Optimistic Update: Update UI immediately to provide instant feedback
        const previousCount = count;
        setCount((prev) => prev + 1);
        setHasClicked(true); // Lock the button immediately

        // Perform background API request
        startTransition(async () => {
            try {
                await fetch("/api/reviews", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId,
                        reviewId,
                        action: "helpfulCount",
                    }),
                });

                // Sync with server data to ensure consistency
                router.refresh();

                toast.success("Thanks for your feedback!", {
                    position: "top-center",
                    style: { fontSize: '14px', background: '#333', color: '#fff' }
                });

            } catch (error) {
                console.error(error);

                // Rollback UI state to previous value
                setCount(previousCount);
                setHasClicked(false);

                toast.error("Something went wrong");
            }
        });
    };

    return (
        <button
            onClick={handleHelpful}
            disabled={hasClicked || isPending}
            className={`flex items-center gap-1 transition-all duration-200 group ${hasClicked
                ? "text-blue-600 font-semibold cursor-default"
                : "text-gray-500 hover:text-gray-900 cursor-pointer"
                }`}
            title={hasClicked ? "You found this helpful" : "Mark as helpful"}
        >
            <span className={`transform transition-transform ${hasClicked ? "scale-110" : "group-hover:scale-110"}`}>
                {hasClicked ? "👏" : "👍"}
            </span>
            <span>{count}</span>
        </button>
    );
}