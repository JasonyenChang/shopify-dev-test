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

        <hr className="border-gray-100 mb-8" />

        {/* Reviews Section */}
        <ReviewsSection
          productId={product.id}
          initialReviews={reviews}
        />
      </div>
    </div>
  );
}
