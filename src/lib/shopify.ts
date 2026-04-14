const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : "";

export class ShopifyConfigError extends Error {}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!domain || !token) {
    throw new ShopifyConfigError(
      "Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN",
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Shopify GraphQL: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}

export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money };
  variants: { nodes: ShopifyVariant[] };
};

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 25) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

export async function getProducts(first = 20): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Products($first: Int!) {
        products(first: $first) {
          nodes {
            ...ProductFields
          }
        }
      }
    `,
    { first },
  );
  return data.products.nodes;
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query Product($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
    `,
    { handle },
  );
  return data.product;
}

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      cost: {
        totalAmount: Money;
      };
      merchandise: {
        id: string;
        title: string;
        price: Money;
        image: ShopifyImage | null;
        product: {
          title: string;
          handle: string;
          featuredImage: ShopifyImage | null;
        };
      };
    }>;
  };
};

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
            product {
              title
              handle
              featuredImage {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

export async function createCart(
  lines: Array<{ merchandiseId: string; quantity: number }> = [],
  discountCodes: string[] = [],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { input: { lines, discountCodes } },
  );
  if (data.cartCreate.userErrors.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join("; "));
  }
  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, lines },
  );
  if (data.cartLinesAdd.userErrors.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join("; "));
  }
  return data.cartLinesAdd.cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, lineIds },
  );
  if (data.cartLinesRemove.userErrors.length) {
    throw new Error(
      data.cartLinesRemove.userErrors.map((e) => e.message).join("; "),
    );
  }
  return data.cartLinesRemove.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity?: number; merchandiseId?: string }>,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ message: string }> };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, lines },
  );
  if (data.cartLinesUpdate.userErrors.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join("; "));
  }
  return data.cartLinesUpdate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      query Cart($cartId: ID!) {
        cart(id: $cartId) {
          ...CartFields
        }
      }
    `,
    { cartId },
  );
  return data.cart;
}

export async function applyDiscount(
  cartId: string,
  discountCodes: string[],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartDiscountCodesUpdate: {
      cart: ShopifyCart;
      userErrors: Array<{ message: string }>;
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart {
            ...CartFields
          }
          userErrors {
            message
          }
        }
      }
    `,
    { cartId, discountCodes },
  );
  if (data.cartDiscountCodesUpdate.userErrors.length) {
    throw new Error(
      data.cartDiscountCodesUpdate.userErrors.map((e) => e.message).join("; "),
    );
  }
  return data.cartDiscountCodesUpdate.cart;
}
