import { Review } from "@/types/shopify";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error("Missing Shopify Admin environment variables");
}

const SHOPIFY_ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`;

export async function shopifyAdminFetch<T>(
    query: string,
    variables?: Record<string, unknown>
): Promise<T> {
    const response = await fetch(SHOPIFY_ADMIN_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Shopify Admin API error: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
        console.error("GraphQL Errors:", JSON.stringify(json.errors, null));
        throw new Error(json.errors[0]?.message || "Shopify Admin GraphQL error");
    }

    return json;
}

// 透過 Product ID 直接從 Admin API 讀取 Metafield
export async function getProductReviews(productId: string): Promise<Review[]> {
    const query = `
    query GetProductReviews($id: ID!) {
      product(id: $id) {
        metafield(namespace: "custom", key: "reviews") {
          value
        }
      }
    }
  `;

    const response = await shopifyAdminFetch<{
        data: {
            product: {
                metafield: { value: string } | null;
            };
        };
    }>(query, { id: productId });

    const value = response.data.product.metafield?.value;
    return value ? JSON.parse(value) : [];
}

export type CreateReviewInput = Omit<Review, "id" | "createdAt" | "helpfulCount" | "verified">;

export async function addProductReview(productId: string, reviewData: CreateReviewInput): Promise<Review> {
    const newReview: Review = {
        id: crypto.randomUUID(),
        productId,
        rating: reviewData.rating,
        text: reviewData.text,
        userName: reviewData.userName,
        helpfulCount: 0,
        createdAt: new Date().toISOString(),
    };

    // Read existing reviews from Metafield
    const readQuery = `
    query GetProductMetafield($id: ID!) {
      product(id: $id) {
        metafield(namespace: "custom", key: "reviews") {
          value
        }
      }
    }
  `;

    interface ReadResponse {
        data: {
            product: {
                metafield: { value: string } | null;
            };
        };
    }

    const readData = await shopifyAdminFetch<ReadResponse>(readQuery, { id: productId });

    const existingValue = readData.data.product.metafield?.value;
    const currentReviews: Review[] = existingValue ? JSON.parse(existingValue) : [];

    // Merge reviews
    const updatedReviews = [newReview, ...currentReviews];

    const writeMutation = `
    mutation SetProductReviews($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const variables = {
        metafields: [
            {
                ownerId: productId,
                namespace: "custom",
                key: "reviews",
                type: "json",
                value: JSON.stringify(updatedReviews),
            },
        ],
    };

    await shopifyAdminFetch(writeMutation, variables);

    return newReview;
}