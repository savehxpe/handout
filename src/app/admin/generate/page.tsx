"use client";

import { useEffect, useState } from "react";

const presets = [
  { key: "hoodie", label: "HOODIE" },
  { key: "tee", label: "T-SHIRT" },
  { key: "vinyl", label: "VINYL" },
  { key: "sticker", label: "STICKER PACK" },
  { key: "poster", label: "POSTER" },
] as const;

const sizes = ["1:1", "4:5", "3:4", "16:9", "9:16"] as const;

type Result = {
  taskId: string;
  status: "pending" | "success" | "failed";
  urls?: string[];
  error?: string;
};

export default function GeneratePage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [preset, setPreset] = useState<(typeof presets)[number]["key"] | "">("hoodie");
  const [customPrompt, setCustomPrompt] = useState("");
  const [imageSize, setImageSize] = useState<(typeof sizes)[number]>("1:1");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_password="));
    if (cookie) setUnlocked(true);
  }, []);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    document.cookie = `admin_password=${encodeURIComponent(password)}; path=/; max-age=86400; samesite=lax`;
    setUnlocked(true);
  }

  async function generate() {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const res = await fetch("/api/generate-artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: customPrompt.trim() ? undefined : preset || undefined,
          prompt: customPrompt.trim() || undefined,
          imageSize,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      const taskId = json.taskId as string;
      setResult({ taskId, status: "pending" });
      poll(taskId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function poll(taskId: string) {
    const started = Date.now();
    while (Date.now() - started < 1000 * 60 * 5) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/generate-artifact?taskId=${taskId}`);
        const json = (await res.json()) as Result;
        setResult(json);
        if (json.status === "success" || json.status === "failed") {
          setBusy(false);
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
    setError("Timed out waiting for result");
    setBusy(false);
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <form onSubmit={unlock} className="flex flex-col gap-4 border border-white/30 p-8 w-full max-w-sm">
          <h1 className="font-mono text-xs tracking-[0.3em] uppercase text-white/60">Admin / Generate</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className="bg-transparent border border-white/30 px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="border border-white px-4 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex justify-between items-start border-b border-white/20 pb-4">
          <h1 className="font-mono text-sm tracking-[0.3em] uppercase">Artifact Generator</h1>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Kie / Nano Banana</span>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPreset(p.key);
                    setCustomPrompt("");
                  }}
                  className={`border px-3 py-3 font-mono text-[11px] tracking-widest uppercase transition-colors ${
                    preset === p.key && !customPrompt.trim()
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white hover:border-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60 mt-2">
              Custom prompt (overrides preset)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              placeholder="Describe the artifact..."
              className="bg-transparent border border-white/30 px-4 py-3 font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-white resize-none"
            />

            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60 mt-2">Size</label>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setImageSize(s)}
                  className={`border px-3 py-2 font-mono text-[11px] tracking-widest ${
                    imageSize === s ? "border-white bg-white text-black" : "border-white/30 hover:border-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={busy}
              className="mt-4 border border-white px-4 py-4 font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? "Generating..." : "Generate"}
            </button>

            {error && (
              <div className="border border-red-500/60 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-300 break-words">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">Result</label>
            <div className="border border-white/20 aspect-square flex items-center justify-center bg-white/5 relative overflow-hidden">
              {result?.urls?.[0] ? (
                <img
                  src={result.urls[0]}
                  alt="Generated artifact"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
                  {busy ? "Transmitting..." : "Awaiting signal"}
                </span>
              )}
            </div>
            {result?.urls && result.urls.length > 0 && (
              <a
                href={result.urls[0]}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-center hover:bg-white hover:text-black transition-colors"
              >
                Download
              </a>
            )}
            {result?.taskId && (
              <span className="font-mono text-[9px] tracking-widest text-white/30 break-all">
                Task: {result.taskId} / {result.status}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
