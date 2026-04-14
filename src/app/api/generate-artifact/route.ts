import { NextRequest, NextResponse } from "next/server";
import { createArtifactTask, getTaskResult, presetPrompts, PresetKey } from "@/lib/kie";

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const provided =
    req.headers.get("x-admin-password") ??
    req.cookies.get("admin_password")?.value;
  return provided === expected;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    preset?: PresetKey;
    prompt?: string;
    imageSize?: string;
    imageUrls?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const basePrompt = body.preset
    ? presetPrompts[body.preset]
    : (body.prompt?.trim() ?? "");
  if (!basePrompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const taskId = await createArtifactTask(
      basePrompt,
      body.imageSize ?? "1:1",
      body.imageUrls,
    );
    return NextResponse.json({ taskId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  try {
    const result = await getTaskResult(taskId);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
