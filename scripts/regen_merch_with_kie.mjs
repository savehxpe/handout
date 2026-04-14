#!/usr/bin/env node
/**
 * Regenerate PSA merch mockups via KIE.ai (google/nano-banana).
 *
 * Reads KIE_AI_API from .env.local, creates a task per artifact,
 * polls until done, downloads result into public/merch/ as *-kie.png.
 *
 * Usage:
 *   node scripts/regen_merch_with_kie.mjs
 *   node scripts/regen_merch_with_kie.mjs psa-hoodie-front
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENV_FILE = resolve(ROOT, ".env.local");
const OUT_DIR = resolve(ROOT, "public/merch");
const KIE_API = "https://api.kie.ai/api/v1";

function loadEnv() {
  if (!existsSync(ENV_FILE)) throw new Error(".env.local not found");
  const raw = readFileSync(ENV_FILE, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const KEY = process.env.KIE_AI_API;
if (!KEY) { console.error("Missing KIE_AI_API"); process.exit(1); }

const AESTHETIC =
  "Monochrome black and white product photography, pure solid black background, no yellow, no overlays, no text watermarks, no UI elements, high contrast, subtle film grain, hard directional studio lighting, centered isolated product, minimalist editorial, Outworld cyberpunk mythology, ultra sharp detail, square composition.";

const ARTIFACTS = [
  {
    slug: "psa-shirt-black-front",
    prompt: `Black heavyweight cotton t-shirt, flat front view, centered, large distressed white "PSA" graphic print on chest with small "Save Hope For The Future" inset photo. ${AESTHETIC}`,
  },
  {
    slug: "psa-shirt-cities-back",
    prompt: `Plain empty black heavyweight cotton t-shirt, flat back view, centered, completely blank back with no text, no graphics, no prints, no logos, no labels. Pure solid black background. ${AESTHETIC}`,
  },
  {
    slug: "psa-shirt-white",
    prompt: `White heavyweight cotton t-shirt, flat front view, centered, bold black-and-white protest graphic print featuring silhouetted figures raising signs reading "SAVE HOPE" and "FUTURE", strictly monochrome ink, no yellow, no color, only black and white. Shirt pure white, background pure solid black. ${AESTHETIC}`,
  },
  {
    slug: "psa-hoodie-front",
    prompt: `Oversized black heavyweight hoodie, front view, centered on solid black background, large hand-drawn white "PSA" signature scrawl across chest, drawstrings visible, clean studio shot. ${AESTHETIC}`,
  },
  {
    slug: "psa-hoodie-back",
    prompt: `Oversized black heavyweight hoodie, back view with hood up, centered, small white crown emblem embroidered upper back between shoulder blades. ${AESTHETIC}`,
  },
];

async function createTask(prompt) {
  const res = await fetch(`${KIE_API}/jobs/createTask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "google/nano-banana",
      input: { prompt, image_size: "1:1", output_format: "png" },
    }),
  });
  const j = await res.json();
  if (j.code !== 200 || !j.data?.taskId) throw new Error(`createTask: ${j.msg} (${j.code})`);
  return j.data.taskId;
}

async function pollTask(taskId, { intervalMs = 4000, maxWaitMs = 240_000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${KIE_API}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const j = await res.json();
    if (j.code === 200 && j.data) {
      const state = (j.data.state ?? j.data.status ?? "").toLowerCase();
      let urls = j.data.resultUrls;
      if (!urls && j.data.resultJson) {
        try { urls = JSON.parse(j.data.resultJson).resultUrls; } catch {}
      }
      if (urls?.length) return urls;
      if (state === "fail" || state === "failed") throw new Error(j.data.failMsg ?? "task failed");
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("poll timeout");
}

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
}

const filter = process.argv[2];
const targets = filter ? ARTIFACTS.filter((a) => a.slug === filter) : ARTIFACTS;
if (!targets.length) { console.error(`no match for "${filter}"`); process.exit(1); }

for (const a of targets) {
  console.log(`→ ${a.slug}: creating task`);
  try {
    const taskId = await createTask(a.prompt);
    console.log(`  taskId=${taskId}, polling…`);
    const urls = await pollTask(taskId);
    const out = resolve(OUT_DIR, `${a.slug}-kie.png`);
    await download(urls[0], out);
    console.log(`  ✓ saved ${out}`);
  } catch (e) {
    console.error(`  ✗ ${a.slug}: ${e.message}`);
  }
}
