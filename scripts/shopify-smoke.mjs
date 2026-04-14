const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";

if (!domain || !token) {
  console.error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN");
  process.exit(1);
}

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

const query = `
  query {
    shop { name primaryDomain { url } }
    products(first: 5) {
      nodes { id handle title priceRange { minVariantPrice { amount currencyCode } } }
    }
  }
`;

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  },
  body: JSON.stringify({ query }),
});

const json = await res.json();
if (!res.ok || json.errors) {
  console.error("FAIL", res.status, JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log("OK", JSON.stringify(json.data, null, 2));
