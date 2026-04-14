import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  // In a real implementation, we would verify 'state' against sessionStorage 
  // and then exchange the code for a token via a POST to /api/auth/shopify/token
  
  // For now, we redirect back to the home page with the code so the client can handle it
  // or trigger the token exchange.
  return NextResponse.redirect(new URL(`/?shopify_code=${code}`, request.url));
}
