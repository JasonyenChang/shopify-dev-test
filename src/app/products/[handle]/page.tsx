import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct } from "@/lib/shopify/client";
import { formatPrice } from "@/lib/utils";
import { Review } from "@/types/shopify";
import ReviewsSection from "@/components/ReviewsSection";
import { getProductReviews } from "@/lib/shopify/admin";
interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const reviews: Review[] = await getProductReviews(product.id);
  console.log("# product and reviews #", new Date(), product, reviews)

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  const firstImage = product.images.edges[0]?.node;
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const priceDisplay =
    minVariantPrice.amount === maxVariantPrice.amount
      ? formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)
      : `${formatPrice(
        minVariantPrice.amount,
        minVariantPrice.currencyCode
      )} - ${formatPrice(
        maxVariantPrice.amount,
        maxVariantPrice.currencyCode
      )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {firstImage ? (
                <Image
                  src={firstImage.url}
                  alt={firstImage.altText || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.productType}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

              <div className="text-2xl font-semibold text-blue-600 mb-6">
                {priceDisplay}
              </div>

              <div className="prose prose-sm mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>

              {product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
              </div>

              {reviewCount > 0 && (
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

            {/* <AddReviewButton productId={product.id} /> */}
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Reviews Section - TO BE IMPLEMENTED */}
        <ReviewsSection
          productId={product.id}
          initialReviews={reviews}
        />
        {/* <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{review.userName}</span>
                    <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                  <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Was this helpful?</span>
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        👍 {review.helpfulCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
          )}

        </div> */}
      </div>
    </div>
  );
}
