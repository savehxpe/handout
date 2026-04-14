"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ArtistPayload } from "@/lib/spotify";

function fmtDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtNumber(n: number | undefined): string | null {
  if (typeof n !== "number") return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ArtistSpotlight() {
  const [data, setData] = useState<ArtistPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/spotify/artist")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json() as Promise<ArtistPayload>;
      })
      .then(setData)
      .catch((e) => setError(e.message ?? "Failed to load"));
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function togglePreview(trackId: string, url: string | null) {
    if (!url) return;
    if (playing === trackId) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const a = new Audio(url);
    a.volume = 0.7;
    a.onended = () => setPlaying(null);
    a.play().then(() => setPlaying(trackId)).catch(() => setPlaying(null));
    audioRef.current = a;
  }

  if (error) {
    return (
      <section className="bg-black text-white font-mono px-6 py-16 text-center">
        <p className="text-xs text-white/50">TRANSMISSION OFFLINE — {error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="bg-black text-white font-mono px-6 py-16 text-center animate-pulse">
        <p className="text-xs tracking-[0.4em] text-white/50">TUNING FREQUENCY…</p>
      </section>
    );
  }

  const { artist, topTracks, albums } = data;
  const heroImg = artist.images[0]?.url;
  const followers = fmtNumber(artist.followers?.total);

  return (
    <section className="bg-black text-white font-mono px-6 py-16 md:py-24">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row gap-8 items-center md:items-end border-b border-white/20 pb-8">
        {heroImg && (
          <div className="relative w-44 h-44 md:w-56 md:h-56 border border-white/20 overflow-hidden shrink-0">
            <Image src={heroImg} alt={artist.name} fill sizes="224px" className="object-cover" />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs tracking-[0.4em] text-white/50">ARTIST · SIGNAL</p>
          <h2 className="mt-2 text-3xl md:text-5xl tracking-widest uppercase">{artist.name}</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-white/60 justify-center md:justify-start">
            {followers && <span>{followers} followers</span>}
            {artist.genres?.length ? <span>{artist.genres.slice(0, 3).join(" · ")}</span> : null}
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              Open in Spotify →
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h3 className="text-xs tracking-[0.4em] text-white/50 mb-4">TRANSMISSIONS · TOP</h3>
          <ol className="divide-y divide-white/10 border border-white/20">
            {topTracks.slice(0, 8).map((t, i) => {
              const cover = t.album.images[t.album.images.length - 1]?.url;
              const isActive = playing === t.id;
              const hasPreview = Boolean(t.preview_url);
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[10px] text-white/40 w-5 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {cover && (
                    <div className="relative w-10 h-10 shrink-0">
                      <Image src={cover} alt={t.album.name} fill sizes="40px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <a
                      href={t.external_urls.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs tracking-wide uppercase truncate hover:underline block"
                    >
                      {t.name}
                    </a>
                    <p className="text-[10px] text-white/40 truncate">{t.album.name}</p>
                  </div>
                  <span className="text-[10px] text-white/40 tabular-nums">
                    {fmtDuration(t.duration_ms)}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePreview(t.id, t.preview_url)}
                    disabled={!hasPreview}
                    className="border border-white/20 px-2 py-1 text-[10px] tracking-widest hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
                    aria-label={hasPreview ? "Preview" : "No preview"}
                  >
                    {isActive ? "STOP" : hasPreview ? "PLAY" : "—"}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.4em] text-white/50 mb-4">DISCOGRAPHY</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {albums.map((a) => {
              const cover = a.images[1]?.url ?? a.images[0]?.url;
              return (
                <a
                  key={a.id}
                  href={a.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="group block border border-white/20 hover:border-white/60 transition-colors"
                >
                  {cover && (
                    <div className="relative aspect-square">
                      <Image src={cover} alt={a.name} fill sizes="120px" className="object-cover" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-[10px] tracking-widest uppercase truncate">{a.name}</p>
                    <p className="text-[9px] text-white/40">
                      {a.release_date.slice(0, 4)} · {a.album_type}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
