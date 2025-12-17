export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  metafield: {
    value: string;
    type: string;
  } | null;
}

export interface ShopifyProductResponse {
  data: {
    product: ShopifyProduct | null;
  };
  errors?: Array<{
    message: string;
  }>;
}

export interface Review {
  id: string;
  productId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  userName: string;
  userId?: string;
  helpfulCount: number;
  createdAt: string;
  verified?: boolean;
}
