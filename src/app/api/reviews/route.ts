import { NextResponse } from "next/server";
import { addProductReview, incrementHelpfulCount } from "@/lib/shopify/admin";

// Handle creating a new review
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, review } = body;

        if (!productId || !review) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newReview = await addProductReview(productId, review);

        return NextResponse.json({ success: true, review: newReview });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}

// Handle updating a review (e.g., increment helpful count)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { productId, reviewId, action } = body;

        if (!productId || !reviewId) {
            return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
        }

        // Check action type
        if (action === "helpfulCount") {
            await incrementHelpfulCount(productId, reviewId);
        } else {
            // Optional: Handle invalid actions or return 400
            // For now, we just ignore unknown actions or handle them as needed
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error (PATCH):", error);
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}