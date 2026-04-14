import { NextRequest, NextResponse } from "next/server";

/**
 * ManyChat inbound webhook. Set this URL as an "External Request"
 * action inside a ManyChat Flow — ManyChat will POST subscriber
 * payload here, and the JSON you return can be mapped to custom fields.
 *
 * URL in prod: https://savehxpe.com/api/manychat/webhook
 * URL in dev:  expose via ngrok/cloudflared and point the flow there.
 *
 * Optional auth: ManyChat supports custom headers on External Requests.
 * Set header `x-manychat-secret: <your secret>` and verify here.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (!secret) return true; // allow if no secret configured yet
  return req.headers.get("x-manychat-secret") === secret;
}

type InboundPayload = {
  subscriber?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  };
  last_input_text?: string;
  key?: string;
  // ManyChat lets you pass any custom fields in the External Request body
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ version: "v2", content: { messages: [] } }, { status: 401 });
  }

  let body: InboundPayload;
  try { body = (await req.json()) as InboundPayload; }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const input = (body.last_input_text ?? "").trim().toUpperCase();
  const first = body.subscriber?.first_name ?? "traveler";

  // Route by keyword. Extend as drops + flows grow.
  if (input === "DROP") {
    return NextResponse.json({
      version: "v2",
      content: {
        messages: [
          { type: "text", text: `Signal received, ${first}. Next drop: 2026-05-01 · 22:22 UTC.` },
          { type: "text", text: "Unlock early: https://savehxpe.com/archive" },
        ],
      },
    });
  }

  if (input === "PSA" || input === "ARCHIVE") {
    return NextResponse.json({
      version: "v2",
      content: {
        messages: [
          { type: "text", text: "PSA Merch Archive — recovered artifacts." },
          { type: "text", text: "https://savehxpe.com/archive" },
        ],
      },
    });
  }

  if (input === "SOUNDS" || input === "MUSIC") {
    return NextResponse.json({
      version: "v2",
      content: {
        messages: [
          { type: "text", text: "Live transmission → https://savehxpe.com/sounds" },
        ],
      },
    });
  }

  // Default: hand control back to ManyChat, no reply from us
  return NextResponse.json({
    version: "v2",
    content: { messages: [] },
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "ManyChat webhook — POST only" });
}
