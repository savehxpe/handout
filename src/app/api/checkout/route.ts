import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

const ASCENSION_TIERS = {
  standard: {
    name: "Outworld Citizenship — The Outsiders",
    description: "1,000 CR/month · 1.5x XP · Full Vault Access",
    amount: 350, // $3.50
  },
  premium: {
    name: "Outworld Citizenship — Premium",
    description: "Unlimited Credits · 3x XP · Full Vault + Priority · Exclusive Drops",
    amount: 560, // $5.60
  },
} as const;

type TierKey = keyof typeof ASCENSION_TIERS;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tier: TierKey = body.tier === "premium" ? "premium" : "standard";
    const uid: string | undefined = body.uid;
    const email: string | undefined = body.email;

    if (!uid) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const product = ASCENSION_TIERS[tier];

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email || undefined,
      metadata: {
        uid,
        tier,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get("origin") || ""}/?ascension=success`,
      cancel_url: `${request.headers.get("origin") || ""}/?ascension=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[Stripe] Checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
