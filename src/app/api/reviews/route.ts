import { NextResponse } from "next/server";
import { addProductReview, CreateReviewInput } from "@/lib/shopify/admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, review } = body;

        if (!productId || !review) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newReview = await addProductReview(productId, review as CreateReviewInput);

        return NextResponse.json({ success: true, review: newReview });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}