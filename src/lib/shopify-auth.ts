"use client";

/**
 * Shopify Customer Account API (OAuth) Helper
 * 
 * Used for authenticating customers and managing their sessions.
 * Integration with:
 * - SHOPIFY_AUTH_ENDPOINT
 * - SHOPIFY_TOKEN_ENDPOINT
 * - SHOPIFY_CLIENT_ID
 */

export const SHOPIFY_AUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID,
  authEndpoint: process.env.SHOPIFY_AUTH_ENDPOINT,
  tokenEndpoint: process.env.SHOPIFY_TOKEN_ENDPOINT,
  logoutEndpoint: process.env.SHOPIFY_LOGOUT_ENDPOINT,
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/api/auth/shopify/callback` : "",
  scopes: "openid email customer_read customer_write",
};

export function getShopifyLoginUrl() {
  const { authEndpoint, clientId, redirectUri, scopes } = SHOPIFY_AUTH_CONFIG;
  const state = Math.random().toString(36).substring(7);
  // Store state in session para prevent CSRF
  if (typeof window !== "undefined") {
    sessionStorage.setItem("shopify_auth_state", state);
  }

  const url = new URL(authEndpoint!);
  url.searchParams.append("client_id", clientId!);
  url.searchParams.append("scope", scopes);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("state", state);
  
  return url.toString();
}

/**
 * Exchange code for access token (Server-side)
 */
export async function exchangeShopifyCode(code: string) {
  const response = await fetch("/api/auth/shopify/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to exchange Shopify auth code");
  }
  
  return await response.json();
}
