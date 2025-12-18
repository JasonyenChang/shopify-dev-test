## 💾 Storage Strategy

I chose **Option A: Shopify Metafields** for this project. The reviews are stored as a JSON string within a custom product metafield (`custom.reviews`).

### Why this approach?
1.  **Simplicity & Maintenance**: Keeps the entire product data lifecycle within the Shopify ecosystem without external dependencies (Supabase/Firebase).
2.  **Performance (Read)**: Allows fetching product details and reviews in a single GraphQL query via the Storefront API, reducing network round-trips.
3.  **Cost Efficiency**: No additional infrastructure costs for a separate database.

### ⚠️ Limitations & Trade-offs (Known Issues)

While this solution is efficient for a prototype or a small-to-medium store, I acknowledge the following limitations for scaling:

1.  **Concurrency / Race Conditions**:
    * Since updating a metafield requires a *Read-Modify-Write* cycle, simultaneous submissions could lead to data loss (the "last write wins" problem).
    * *Production Fix*: Implement a server-side queue (e.g., Redis) or use a database with row-level locking.

2.  **Scalability (Size Limit)**:
    * Shopify Metafields have a storage limit (approx. 2MB for JSON). A popular product with thousands of reviews would hit this limit.
    * *Production Fix*: Archive old reviews to an external DB or strictly use an external DB for storage.

3.  **Pagination Performance**:
    * The Storefront API fetches the entire JSON blob. We cannot paginate server-side (e.g., "fetch only page 2"). Downloading 500+ reviews at once impacts initial page load performance.
    * *Production Fix*: Store reviews in an indexed database (PostgreSQL/MongoDB) to support `LIMIT` and `OFFSET` queries.