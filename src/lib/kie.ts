const KIE_API = "https://api.kie.ai/api/v1";

type KieCreateResponse = {
  code: number;
  msg: string;
  data: { taskId: string } | null;
};

type KieRecordResponse = {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state?: string;
    status?: string;
    resultJson?: string;
    resultUrls?: string[];
    failCode?: string | number;
    failMsg?: string;
  } | null;
};

export type KieTaskResult = {
  taskId: string;
  status: "pending" | "success" | "failed";
  urls?: string[];
  error?: string;
};

const aestheticSuffix =
  "Monochrome black and white, pure black background, high contrast, subtle film grain and noise texture, minimalist product photography, hard directional lighting, stark editorial composition, monospace type aesthetic, noir, Outworld cyberpunk mythology, studio isolated product shot, ultra sharp detail.";

export const presetPrompts = {
  hoodie: `Oversized heavyweight black hoodie laid flat, subtle white chest print reading "SAVE HXPE" in monospace type, clean centered composition. ${aestheticSuffix}`,
  tee: `Black heavyweight cotton t-shirt laid flat, small white monospace print on front reading "HANDOUT REMIX", minimalist. ${aestheticSuffix}`,
  vinyl: `12-inch vinyl record and matte black album sleeve with embossed white logo, sleeve slightly overlapping the record, close-up detail. ${aestheticSuffix}`,
  sticker: `Matte black die-cut vinyl sticker pack with Outworld glyphs in thin white linework, scattered on black surface, overhead shot. ${aestheticSuffix}`,
  poster: `Tour poster for Save Hxpe Handout Remix featuring Freddie Gibbs, monospaced typography, brutalist layout, black background with fine grain. ${aestheticSuffix}`,
};

export type PresetKey = keyof typeof presetPrompts;

function apiKey() {
  const k = process.env.KIE_AI_API;
  if (!k) throw new Error("Missing KIE_AI_API env var");
  return k;
}

export async function createArtifactTask(
  prompt: string,
  imageSize: string = "1:1",
  imageUrls?: string[],
): Promise<string> {
  const useEdit = imageUrls && imageUrls.length > 0;
  const res = await fetch(`${KIE_API}/jobs/createTask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: useEdit ? "google/nano-banana-edit" : "google/nano-banana",
      input: {
        prompt,
        image_size: imageSize,
        output_format: "png",
        ...(useEdit ? { image_urls: imageUrls } : {}),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Kie createTask HTTP ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as KieCreateResponse;
  if (json.code !== 200 || !json.data?.taskId) {
    throw new Error(`Kie createTask error: ${json.msg} (code ${json.code})`);
  }
  return json.data.taskId;
}

export async function getTaskResult(taskId: string): Promise<KieTaskResult> {
  const res = await fetch(`${KIE_API}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Kie recordInfo HTTP ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as KieRecordResponse;

  if (json.code !== 200 || !json.data) {
    return { taskId, status: "pending" };
  }

  const state = (json.data.state ?? json.data.status ?? "").toLowerCase();
  const urls =
    json.data.resultUrls ??
    (json.data.resultJson ? (() => {
      try {
        const parsed = JSON.parse(json.data!.resultJson!);
        return parsed.resultUrls ?? parsed.urls ?? [];
      } catch {
        return [];
      }
    })() : []);

  if (state === "success" || (urls && urls.length > 0)) {
    return { taskId, status: "success", urls };
  }
  if (state === "fail" || state === "failed") {
    return {
      taskId,
      status: "failed",
      error: json.data.failMsg ?? "Task failed",
    };
  }
  return { taskId, status: "pending" };
}
