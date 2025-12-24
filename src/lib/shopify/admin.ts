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

interface ProductReviewsResponse {
  data: {
    product: {
      metafield: { value: string } | null;
    };
  };
}

// Fetch product reviews
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

  const response = await shopifyAdminFetch<ProductReviewsResponse>(query, {
    id: productId
  });

  const value = response.data.product.metafield?.value;
  return value ? JSON.parse(value) : [];
}

export async function incrementHelpfulCount(productId: string, reviewId: string): Promise<void> {
  // Fetch existing reviews
  const currentReviews = await getProductReviews(productId);

  if (currentReviews.length === 0) return;

  // Find the specific review and increment the count
  const updatedReviews = currentReviews.map((review) => {
    if (review.id === reviewId) {
      return {
        ...review,
        helpfulCount: (review.helpfulCount || 0) + 1,
      };
    }
    return review;
  });

  const jsonString = JSON.stringify(updatedReviews);

  // 3. Write: Updated GraphQL structure to match the homework example
  const writeMutation = `
    mutation SetProductReview($productId: ID!, $reviewsJson: String!) {
      metafieldsSet(
        metafields: [
          {
            namespace: "custom"
            key: "reviews"
            ownerId: $productId
            type: "json"
            value: $reviewsJson
          }
        ]
      ) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  // 4. Variables: Now passing distinct arguments instead of a metafields object
  const variables = {
    productId: productId,
    reviewsJson: jsonString,
  };

  await shopifyAdminFetch(writeMutation, variables);
}

export async function addProductReview(productId: string, reviewData: Review): Promise<Review> {
  const currentReviews = await getProductReviews(productId);

  // Merge reviews
  const updatedReviews = [reviewData, ...currentReviews];
  const jsonString = JSON.stringify(updatedReviews);

  const writeMutation = `
    mutation SetProductReview($productId: ID!, $reviewsJson: String!) {
      metafieldsSet(
        metafields: [
          {
            namespace: "custom"
            key: "reviews"
            ownerId: $productId
            type: "json"
            value: $reviewsJson
          }
        ]
      ) {
        metafields {
          key
          namespace
          value
          createdAt
          updatedAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    productId: productId,
    reviewsJson: jsonString
  };

  await shopifyAdminFetch(writeMutation, variables);

  return reviewData;
}