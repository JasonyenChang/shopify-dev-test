import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Product Review Starter</h1>
        <p className="text-gray-600 mb-8">
          This is a starter codebase for the Shopify Product Review assignment.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/products/stainless-steel-water-bottle"
            className="inline-block bg-white text-blue border border-blue px-6 py-3 rounded-lg hover:bg-blue-200 transition"
          >
            Stainless Steel Water Bottle
          </Link>

          <Link
            href="/products/organic-cotton-t-shirt"
            className="inline-block bg-white text-blue border border-blue px-6 py-3 rounded-lg hover:bg-blue-200 transition"
          >
            Organic Cotton T-Shirt
          </Link>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Update the product handle in the link above
            to match a product in your Shopify store.
          </p>
        </div>
      </div>
    </div>
  );
}
