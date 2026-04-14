"use client";

import { useEffect, useRef, useState } from "react";
import { useDiscount } from "@/contexts/DiscountContext";

const SCORE_THRESHOLD = 500;
const POINTS_PER_HIT = 10;
const DURATION_MS = 30000;
const BEST_KEY = "outworld_best_score";

type Orb = { id: number; x: number; y: number; r: number; born: number };
type Pop = { id: number; x: number; y: number; born: number };

export default function ArcadeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION_MS / 1000);
  const [finished, setFinished] = useState(false);
  const orbsRef = useRef<Orb[]>([]);
  const popsRef = useRef<Pop[]>([]);
  const flashRef = useRef(0);
  const rafRef = useRef<number>(0);
  const { reveal, revealed } = useDiscount();

  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved) setBest(parseInt(saved, 10) || 0);
  }, []);

  useEffect(() => {
    if (score >= SCORE_THRESHOLD) reveal();
  }, [score, reveal]);

  function spawn() {
    const c = canvasRef.current;
    if (!c) return;
    orbsRef.current.push({
      id: Date.now() + Math.random(),
      x: 24 + Math.random() * (c.width - 48),
      y: 24 + Math.random() * (c.height - 48),
      r: 14 + Math.random() * 10,
      born: performance.now(),
    });
    if (orbsRef.current.length > 7) orbsRef.current.shift();
  }

  function draw(now: number) {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 20; i < c.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, c.height);
      ctx.stroke();
    }
    for (let i = 20; i < c.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(c.width, i);
      ctx.stroke();
    }

    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flashRef.current * 0.15})`;
      ctx.fillRect(0, 0, c.width, c.height);
      flashRef.current = Math.max(0, flashRef.current - 0.08);
    }

    for (const orb of orbsRef.current) {
      const age = (now - orb.born) / 1000;
      const pulse = 1 + Math.sin(age * 6) * 0.05;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    popsRef.current = popsRef.current.filter((p) => now - p.born < 500);
    for (const pop of popsRef.current) {
      const t = (now - pop.born) / 500;
      const r = 10 + t * 40;
      ctx.beginPath();
      ctx.arc(pop.x, pop.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${1 - t})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "bold 14px ui-monospace, monospace";
      ctx.fillStyle = `rgba(255,255,255,${1 - t})`;
      ctx.textAlign = "center";
      ctx.fillText("+10", pop.x, pop.y - 20 - t * 20);
    }
  }

  function start() {
    if (running) return;
    setScore(0);
    setFinished(false);
    setRunning(true);
    setTimeLeft(DURATION_MS / 1000);
    orbsRef.current = [];
    popsRef.current = [];

    const startedAt = performance.now();
    let lastSpawn = startedAt;

    const loop = (now: number) => {
      const elapsed = now - startedAt;
      if (elapsed >= DURATION_MS) {
        setRunning(false);
        setFinished(true);
        orbsRef.current = [];
        draw(now);
        setScore((s) => {
          setBest((b) => {
            const next = Math.max(b, s);
            localStorage.setItem(BEST_KEY, String(next));
            return next;
          });
          return s;
        });
        return;
      }
      setTimeLeft(Math.ceil((DURATION_MS - elapsed) / 1000));
      if (now - lastSpawn > 650) {
        spawn();
        lastSpawn = now;
      }
      draw(now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function hit(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!running) return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    let clientX: number;
    let clientY: number;
    if ("touches" in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const idx = orbsRef.current.findIndex(
      (o) => Math.hypot(o.x - x, o.y - y) <= o.r + 4,
    );
    if (idx >= 0) {
      const orb = orbsRef.current[idx];
      popsRef.current.push({
        id: Date.now() + Math.random(),
        x: orb.x,
        y: orb.y,
        born: performance.now(),
      });
      flashRef.current = 1;
      orbsRef.current.splice(idx, 1);
      setScore((s) => s + POINTS_PER_HIT);
    }
  }

  const pct = Math.min(100, (score / SCORE_THRESHOLD) * 100);
  const won = score >= SCORE_THRESHOLD;

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="grid grid-cols-3 w-full font-mono text-[10px] tracking-[0.3em] uppercase gap-2">
        <div className="flex flex-col border border-white/20 px-3 py-2">
          <span className="text-white/40">Score</span>
          <span className="text-white text-base font-bold tracking-widest">{score}</span>
        </div>
        <div className="flex flex-col border border-white/20 px-3 py-2">
          <span className="text-white/40">Target</span>
          <span className="text-white text-base font-bold tracking-widest">{SCORE_THRESHOLD}</span>
        </div>
        <div className="flex flex-col border border-white/20 px-3 py-2">
          <span className="text-white/40">{running ? "Time" : "Best"}</span>
          <span className="text-white text-base font-bold tracking-widest">
            {running ? `${timeLeft}s` : best}
          </span>
        </div>
      </div>

      <div className="h-[2px] w-full bg-white/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={480}
          height={280}
          onMouseDown={hit}
          onTouchStart={hit}
          className="w-full max-w-xl mx-auto block border border-white/30 cursor-crosshair touch-none bg-black"
        />
        {!running && finished && won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
            <span className="font-mono text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase text-white">
              ARTIFACT FORGED
            </span>
          </div>
        )}
        {!running && finished && !won && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
            <span className="font-mono text-lg tracking-[0.3em] uppercase text-white/70">
              TRY AGAIN
            </span>
          </div>
        )}
      </div>

      <button
        onClick={start}
        disabled={running}
        className="border border-white px-10 py-4 font-mono text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {running ? "TRANSMITTING..." : won || revealed ? "REPLAY" : finished ? "RETRY" : "BEGIN TRANSMISSION"}
      </button>
    </div>
  );
}
