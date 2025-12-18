## Setup instructions

Install the frontend packages.
```
npm install
```

Configure your Shopify credentials in `.env.local`. (copy `.env.example` if you don't have one)
```
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_ADMIN_ACCESS_TOKEN=
```

Run the app.
```
npm run dev
```

Create at least 2 products with these details:

   **Product 1: Organic Cotton T-Shirt**

   - Title: Organic Cotton T-Shirt
   - Description: Soft, breathable organic cotton t-shirt
   - Price: $29.99
   - Product type: Apparel
   - Tags: organic, sustainable, casual
   - Add an image (use placeholder if needed)
   - Handle will be: `organic-cotton-t-shirt`

   **Product 2: Stainless Steel Water Bottle**

   - Title: Stainless Steel Water Bottle
   - Description: Insulated water bottle keeps drinks cold for 24 hours
   - Price: $24.99
   - Product type: Accessories
   - Tags: eco-friendly, travel, hydration
   - Handle will be: `stainless-steel-water-bottle`

And open http://localhost:3000 in your browser, then you can start testing!

## Storage solution chosen and why

I chose **Option A: Shopify Metafields** for this project. The reviews are stored as a JSON string within a custom product metafield (`custom.reviews`).

### Why this approach?
1.  **Simplicity & Maintenance**: Keeps the entire product data lifecycle within the Shopify ecosystem without external dependencies (Supabase/Firebase).
2.  **Cost Efficiency**: No additional infrastructure costs for a separate database.

### ⚠️ Limitations & Trade-offs (Known Issues)

While this solution is efficient for a prototype or a small-to-medium store, I acknowledge the following limitations for scaling:

1.  **Concurrency / Race Conditions**:
    * Since updating a metafield requires a *Read-Modify-Write* cycle, simultaneous submissions could lead to data loss (the "last write wins" problem).

2.  **Scalability (Size Limit)**:
    * Shopify Metafields have a storage limit (approx. 2MB for JSON). A popular product with thousands of reviews would hit this limit.

3.  **Pagination Performance**:
    * The Storefront API fetches the entire JSON blob. We cannot paginate server-side (e.g., "fetch only page 2"). Downloading 500+ reviews at once impacts initial page load performance.

## What you would improve with more time