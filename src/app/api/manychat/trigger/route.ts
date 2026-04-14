import { NextRequest, NextResponse } from "next/server";
import { addTag, setCustomField, sendFlow, sendContent, type ManyChatContentMessage } from "@/lib/manychat";

type TriggerBody = {
  subscriberId: string;
  tag?: string;
  customField?: { name: string; value: unknown };
  flowNs?: string;
  messages?: ManyChatContentMessage[];
  messageTag?: "ACCOUNT_UPDATE" | "POST_PURCHASE_UPDATE" | "CONFIRMED_EVENT_UPDATE";
};

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? process.env.MANYCHAT_INTERNAL_TOKEN;
  if (!expected) return false;
  const provided =
    req.headers.get("x-internal-token") ??
    req.headers.get("x-admin-password") ??
    req.cookies.get("admin_password")?.value;
  return provided === expected;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: TriggerBody;
  try { body = (await req.json()) as TriggerBody; }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  if (!body.subscriberId) {
    return NextResponse.json({ error: "subscriberId required" }, { status: 400 });
  }

  const results: Record<string, unknown> = {};

  try {
    if (body.tag) {
      results.tag = await addTag(body.subscriberId, body.tag);
    }
    if (body.customField) {
      results.customField = await setCustomField(
        body.subscriberId,
        body.customField.name,
        body.customField.value,
      );
    }
    if (body.flowNs) {
      results.flow = await sendFlow(body.subscriberId, body.flowNs);
    }
    if (body.messages?.length) {
      results.content = await sendContent(body.subscriberId, body.messages, body.messageTag ?? "");
    }
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, partial: results }, { status: 500 });
  }
}
