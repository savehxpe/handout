import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      credential: process.env.FIREBASE_ADMIN_KEY
        ? cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY))
        : undefined,
    });
  }
  return getFirestore();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    const tier = session.metadata?.tier || "standard";

    if (uid) {
      try {
        const adminDb = getAdminDb();
        await adminDb.doc(`users/${uid}`).set(
          {
            isAscended: true,
            tier,
            ascendedAt: new Date().toISOString(),
            stripeSessionId: session.id,
            email: session.customer_email || "",
          },
          { merge: true }
        );
        console.log(`[Webhook] Ascension granted for uid: ${uid}, tier: ${tier}`);
      } catch (err) {
        console.error(`[Webhook] Failed to update Firestore for uid: ${uid}`, err);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    } else {
      console.warn("[Webhook] checkout.session.completed missing uid in metadata");
    }
  }

  return NextResponse.json({ received: true });
}
