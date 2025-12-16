import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Product Review Starter</h1>
        <p className="text-gray-600 mb-8">
          This is a starter codebase for the Shopify Product Review assignment.
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 text-left">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              Set up your{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>{" "}
              file
            </li>
            <li>
              Replace the product handle below with a real product from your
              store
            </li>
            <li>Start building the review feature!</li>
          </ol>

          <div className="mt-6">
            <Link
              href="/products/example-product"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Example Product Page
            </Link>
          </div>
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
