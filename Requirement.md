# momogo Interview Assignment

## Overview

Build a product review feature that allows users to leave reviews on product pages. Users can submit reviews either anonymously or as authenticated users. Reviews should be persisted using Shopify metafields or another suitable data storage solution.

## Requirements

### Core Requirements (Must Have)

#### 1. Product Page with Review Section

- Include a dedicated reviews section on the product page
- Display existing reviews in a clean, organized list
- Show review count and average rating prominently

#### 2. Review Submission Form

- Allow users to submit reviews either:
  - **Anonymous**: Name
  - **Authenticated**: Use provided authentication (login code will be supplied)
- Review form should include:
  - Star rating (1-5 stars)
  - Review text (required, max 1000 characters)
  - Would you recommend this product? (Yes/No)
- Form validation with clear error messages
- Loading state during submission
- Success/error feedback after submission

#### 3. Review Display & List

Each review should display:

- Reviewer name
- Star rating (visual representation)
- Review date (formatted, e.g. "Dec 8, 2024")
- Review text
- Verified purchase badge (if authenticated user)
- Helpful count

Additional requirements:

- Sort options: Most Recent, Most Helpful
- Users can mark reviews as helpful (with count)
- Pagination or "Load More" for reviews (10 reviews per page)
- Empty state when no reviews exist

#### 4. Data Storage

Choose and implement one of these storage solutions:

**Option A: Shopify Metafields (Recommended)**

- Store reviews in product metafields using Shopify Admin API
- Structure: `custom.reviews` namespace
- Handle metafield limitations (size constraints)

**Option B: External Database**

- Use Supabase, Firebase, MongoDB, or PostgreSQL
- Store reviews with product reference (product ID/handle)
- Implement proper indexing for queries

**Option C: Hybrid Approach**

- Summary data in Shopify metafields (count, average rating)
- Full reviews in external database
- Explain trade-offs in your README

#### 5. Authentication Integration

A simple authentication system was provided:

```typescript
// Provided auth utilities (you'll receive this code)
interface User {
  id: string;
  email: string;
  name: string;
}

// Check if user is logged in
function useAuth(): { user: User | null; loading: boolean };

// Login/logout functions
async function login(email: string): Promise<User>;
async function logout(): Promise<void>;
```

Your implementation should:

- Mark reviews from logged-in users as "Verified Purchase"
- Allow logged-in users to edit/delete their own reviews (nice-to-have)

---

### Bonus Requirements (Nice to Have)

#### 6. Advanced Review Features

- **Review editing**: Allow users to edit/delete their own reviews

#### 7. Enhanced UX/UI

- **Real-time validation**: Instant feedback as user types
- **Character counters**: Show remaining characters for text fields
- **Rating breakdown**: Visual bar chart showing % of each star rating

#### 8. SEO & Performance

- **SSR for reviews**: Server-render review summary for SEO
- **Structured data**: Implement Product schema with AggregateRating and Review
- **Optimistic UI**: Show review immediately while saving in background
- **Caching strategy**: Cache reviews with smart invalidation

#### 9. Testing & Documentation

- Unit tests for review submission logic
- E2E tests for critical user flows
- API documentation (if using custom backend)

---

## Technical Specifications

### Tech Stack (Required)

**You must use:**

- **Next.js 15+** with App Router (required)
- **React** (must use React - no other frontend frameworks allowed)
- **TypeScript** (required)
- **Tailwind CSS** (required)

**For data storage, choose one:**

- Shopify Admin API + Metafields
- Supabase (with Row Level Security)
- Firebase Firestore
- MongoDB Atlas
- PostgreSQL (self-hosted or managed)

---

### API Details

**Shopify Storefront API Endpoint:**

```
https://{store-name}.myshopify.com/api/2025-10/graphql.json
```

API Reference: https://shopify.dev/docs/api/storefront/latest

**Shopify Admin API Endpoint (if using metafields):**

```
https://{store-name}.myshopify.com/admin/api/2025-10/graphql.json
```

API Reference: https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsset

**Authentication Headers:**

```
# Storefront API
X-Shopify-Storefront-Access-Token: {storefront-token}

# Admin API (for metafields)
X-Shopify-Access-Token: {admin-token}
```

---

### Sample GraphQL Queries

**Fetch Product with Metafields:**

```graphql
query GetProduct($handle: String!) {
  product(handle: $handle) {
    id
    title
    description
    handle
    productType
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 5) {
      edges {
        node {
          url
          altText
        }
      }
    }
    metafields(identifiers: [{ namespace: "custom", key: "reviews" }]) {
      namespace
      key
      value
      type
    }
  }
}
```

**Create/Update Metafield (Admin API):**

```graphql
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
```

---

## Data Schema Examples

### Review Object Structure (Suggested)

```typescript
interface Review {
  id: string;
  productId: string;

  // Review content
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;

  // User info
  userName: string;
  userId?: string; // If authenticated

  // Metadata
  helpfulCount: number;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Shopify Metafield Storage Example

```typescript
// Store reviews in metafield
{
  namespace: "custom",
  key: "reviews",
  type: "json",
  value: JSON.stringify([
    {
      id: "rev_123",
      productId: "gid://shopify/Product/123456789",
      userId: "user_123",
      userName: "John Doe",
      rating: 5,
      text: "This exceeded my expectations...",
      createdAt: "2024-12-08T10:30:00Z",
      helpfulCount: 0
    }
    // ... more reviews
  ])
}
```

---

## 🛍️ Shopify Setup

### Creating a Shopify Development Store

1. **Sign up for Shopify Partners** (Free)

   - Go to https://partners.shopify.com/
   - Click "Join now" and create an account
   - Verify your email

2. **Create a Development Store**

   - Log in to your Partners dashboard
   - Click "Stores" in the left sidebar
   - Click "Add store" → "Development store"
   - Fill in the details:
     - Store name: `yourname-dev-store`
     - Store purpose: "Test app or theme"
     - Build preview store: No
   - Click "Save"

3. **Access Your Store**

   - Wait for store creation (30-60 seconds)
   - Click on your store name
   - Note your store URL: `yourname-dev-store.myshopify.com`

4. **Get Storefront API Credentials**

   - Install https://apps.shopify.com/headless to your store
   - Retrieve Public access token from the app

5. **Get Admin API Credentails (for metafields)**

   - Follow https://help.shopify.com/en/manual/apps/app-types/custom-apps#create-and-install-a-custom-app guide to create a custom app
   - Make sure `read_products,write_products` are selected in the API scopes
   - Install the app to your development store
   - Retrieve the Admin API access token from the app, the token will be in the format `shpat_...`

6. **Create Test Products**:
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

   **Product 3: Yoga Mat**

   - Title: Premium Yoga Mat
   - Description: Non-slip yoga mat with extra cushioning
   - Price: $49.99
   - Product type: Sports & Fitness
   - Tags: yoga, fitness, wellness
   - Handle will be: `premium-yoga-mat`

## Environment Variables

Create a `.env.local` file:

```env
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token  # If using metafields
```

---

## Expected Deliverables

1. **Source Code** - Complete project repository
2. **README** - Must include:
   - Setup instructions
   - Storage solution chosen and why
   - Any assumptions or trade-offs made
   - What you would improve with more time
3. **Demo** - Either:
   - Deployed version (Vercel, Netlify)
   - Screen recording showing all features
   - Local demo with seed data

---

## Test Data

For development and testing:

1. **Create a Shopify development store** (free)
2. **Add test products** with various attributes
3. **Seed initial reviews** for testing filters/sorting
4. **Test scenarios**:
   - Submit review as anonymous user
   - Submit review as logged-in user
   - Mark reviews as helpful
   - Edit/delete own review (if implemented)
   - Try to edit someone else's review (should fail)
   - Submit review with invalid data

---

## Questions?

If you have any questions about the requirements, please reach out. We value clear communication and asking clarifying questions is encouraged.

---

## Tips for Success

- **Plan your storage strategy first** - Understand metafield limitations before choosing
- **Start with read functionality** - Display reviews before building submission form
- **Implement anonymous reviews first** - Add authentication integration after
- **Focus on core UX** - Make the review form intuitive and validating
- **Handle edge cases** - Empty states, validation errors, network failures
- **Document your decisions** - Explain why you chose your storage solution
- **Test thoroughly** - Try to break your own implementation
- **Optimize for SEO** - Reviews are valuable content for search engines

---

## Common Pitfalls to Avoid

1. **Over-engineering** - Don't build features not in requirements
2. **Under-validating** - Always validate on server-side, not just client
3. **Ignoring rate limits** - Shopify APIs have rate limits, handle them
4. **Poor error messages** - Users should understand what went wrong
5. **No loading states** - Always show feedback during async operations
6. **Skipping edge cases** - Test empty states, failures, long text, etc.
7. **Security holes** - Validate user can only edit their own reviews
8. **SEO neglect** - Reviews are valuable content, make them crawlable
9. **Mobile afterthought** - Design mobile-first
10. **No documentation** - Explain your decisions and trade-offs

---

Good luck! 🚀
