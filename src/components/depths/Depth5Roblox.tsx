"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDepthVisibility } from "@/hooks/useDepthVisibility";
import { playJumpBeep, playCrashTone } from "@/lib/audio";
import { signInWithPopup } from "firebase/auth";
import { collection, addDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, getGoogleProvider } from "@/lib/firebase";

// ── Game constants ──
const CANVAS_W = 480;
const CANVAS_H = 150;
const GROUND_Y = 120;
const PLAYER_SIZE = 18;
const OBSTACLE_W = 12;
const OBSTACLE_H_MIN = 24;
const OBSTACLE_H_VAR = 14;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const BASE_SPEED = 4.9; // 3.5 * 1.4 = 40% faster

// ── Leaderboard entry type ──
interface LeaderEntry {
  gameTag: string;
  score: number;
}

// ── Leaderboard component ──
function Leaderboard() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    try {
      const q = query(
        collection(getFirebaseDb(), "leaderboard"),
        orderBy("score", "desc"),
        limit(5)
      );
      const unsub = onSnapshot(q, (snap) => {
        setEntries(snap.docs.map((d) => ({
          gameTag: d.data().gameTag as string,
          score: d.data().score as number,
        })));
      }, () => {});
      return unsub;
    } catch {
      // Firebase not configured — no-op
    }
  }, []);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white drop-shadow-md">
          [ TOP 5 LEADERBOARD ]
        </span>
        <span className="font-mono text-[10px] text-white/60 drop-shadow-md">
          No entries yet
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white drop-shadow-md">
        [ TOP 5 LEADERBOARD ]
      </span>
      {entries.map((e, i) => (
        <div key={i} className="flex justify-between gap-6 font-mono text-[10px] text-white drop-shadow-md">
          <span>{i + 1}. {e.gameTag}</span>
          <span>{e.score}</span>
        </div>
      ))}
    </div>
  );
}

// ── Post-game capture flow ──
type CapturePhase = "tag" | "auth" | "done";

function PostGameCapture({ score }: { score: number }) {
  const [phase, setPhase] = useState<CapturePhase>("tag");
  const [tag, setTag] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleTagSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) return;
    setPhase("auth");
  }

  async function handleGoogleSignIn() {
    setSaving(true);
    try {
      const result = await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
      const email = result.user.email || "";
      await addDoc(collection(getFirebaseDb(), "leaderboard"), {
        gameTag: tag.trim(),
        score,
        email,
        timestamp: Date.now(),
      });
      setPhase("done");
    } catch {
      setSaving(false);
    }
  }

  if (phase === "tag") {
    return (
      <div className="flex flex-col items-center gap-3 mt-3">
        <p className="font-mono text-[10px] tracking-wider text-white drop-shadow-lg">
          Good run. Secure your rank.
        </p>
        <form onSubmit={handleTagSubmit} className="flex gap-2">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="[ ENTER GAME TAG ]"
            maxLength={16}
            required
            className="bg-transparent border border-white/30 px-4 py-2 font-mono text-[10px] tracking-wider text-white placeholder-white/25 outline-none focus:border-white transition-colors w-44"
          />
          <button
            type="submit"
            className="font-mono text-[10px] tracking-wider uppercase border border-white px-4 py-2 text-white transition-colors hover:bg-white hover:text-black"
          >
            SUBMIT
          </button>
        </form>
      </div>
    );
  }

  if (phase === "auth") {
    return (
      <div className="flex flex-col items-center gap-3 mt-3">
        <p className="font-mono text-[10px] tracking-wider text-white drop-shadow-lg text-center max-w-xs leading-relaxed">
          [ MANDATORY: CONNECT GOOGLE ACCOUNT TO VERIFY SCORE AND ACCESS DASHBOARD ]
        </p>
        <button
          onClick={handleGoogleSignIn}
          disabled={saving}
          className="font-mono text-[10px] tracking-wider uppercase border border-white px-6 py-2 text-white transition-colors hover:bg-white hover:text-black disabled:opacity-40"
        >
          {saving ? "CONNECTING..." : "SIGN IN WITH GOOGLE"}
        </button>
      </div>
    );
  }

  return (
    <p className="font-mono text-[10px] tracking-wider text-white drop-shadow-lg mt-3">
      [ SCORE VERIFIED. RANK SECURED. ]
    </p>
  );
}

// ── Endless Runner ──
function EndlessRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);
  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    velocityY: 0,
    jumping: false,
    obstacles: [] as { x: number; h: number }[],
    score: 0,
    gameOver: false,
    speed: BASE_SPEED,
    frameCount: 0,
    crashed: false,
  });
  const rafRef = useRef(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) {
      // Reset
      s.playerY = GROUND_Y - PLAYER_SIZE;
      s.velocityY = 0;
      s.jumping = false;
      s.obstacles = [];
      s.score = 0;
      s.gameOver = false;
      s.crashed = false;
      s.speed = BASE_SPEED;
      s.frameCount = 0;
      setGameOver(false);
      setScore(0);
      return;
    }
    if (!s.jumping) {
      s.velocityY = JUMP_FORCE;
      s.jumping = true;
      playJumpBeep();
    }
  }, []);

  // Visual shifts based on score
  const showBgImage = score >= 20;
  const invertColors = score >= 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    function tick() {
      const s = stateRef.current;

      if (!s.gameOver) {
        // Physics
        s.velocityY += GRAVITY;
        s.playerY += s.velocityY;
        if (s.playerY >= GROUND_Y - PLAYER_SIZE) {
          s.playerY = GROUND_Y - PLAYER_SIZE;
          s.velocityY = 0;
          s.jumping = false;
        }

        // Dynamic speed: increases with score (tuned for +5 per obstacle)
        s.speed = BASE_SPEED + s.score * 0.016;

        // Spawn obstacles
        s.frameCount++;
        const spawnRate = Math.max(50, 110 - s.score * 0.4);
        if (s.frameCount % spawnRate === 0) {
          const h = OBSTACLE_H_MIN + Math.random() * OBSTACLE_H_VAR;
          s.obstacles.push({ x: CANVAS_W, h });
        }

        // Move obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          s.obstacles[i].x -= s.speed;
          if (s.obstacles[i].x + OBSTACLE_W < 0) {
            s.obstacles.splice(i, 1);
            s.score += 5;
            setScore(s.score);
          }
        }

        // Collision
        const px = 36;
        const py = s.playerY;
        for (const obs of s.obstacles) {
          if (
            px + PLAYER_SIZE > obs.x &&
            px < obs.x + OBSTACLE_W &&
            py + PLAYER_SIZE > GROUND_Y - obs.h
          ) {
            s.gameOver = true;
            s.crashed = true;
            setGameOver(true);
            playCrashTone();
            break;
          }
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Player
      ctx.fillStyle = "#fff";
      ctx.fillRect(36, s.playerY, PLAYER_SIZE, PLAYER_SIZE);

      // Obstacles
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      for (const obs of s.obstacles) {
        ctx.fillRect(obs.x, GROUND_Y - obs.h, OBSTACLE_W, obs.h);
      }

      // Game over overlay
      if (s.gameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`[ GAME OVER - SCORE: ${s.score} ]`, CANVAS_W / 2, 70);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  // Auto-start: trigger first jump when game scrolls into view
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoStartedRef.current) {
          autoStartedRef.current = true;
          jump();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [jump]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Solid bg container for legibility */}
      <div ref={boardRef} className="bg-black p-6 border border-white/30 pointer-events-auto">
        {/* Score + hint bar */}
        <div className="flex justify-between w-full max-w-[480px] px-1 mb-2">
          <span className="font-mono text-[10px] tracking-wider text-white drop-shadow-lg">
            SCORE: {score}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-white drop-shadow-lg">
            {gameOver ? "" : "SPACE / TAP TO JUMP"}
          </span>
        </div>

        {/* Game + Leaderboard side by side */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Game container with visual shifts */}
          <div
            ref={containerRef}
            className="relative transition-all duration-700"
            style={{ filter: invertColors ? "invert(1)" : "none" }}
          >
            {/* Score >= 20: subtle dark bg behind canvas */}
            {showBgImage && (
              <div
                className="absolute inset-0 opacity-20 transition-opacity duration-1000"
                style={{
                  backgroundImage: "url(/frames/frame-060.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onClick={jump}
              onTouchStart={jump}
              className="relative border border-white/20 cursor-pointer max-w-full"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Leaderboard beside the canvas */}
          <div className="hidden md:block min-w-[160px]">
            <Leaderboard />
          </div>
        </div>

        {/* Post-game capture */}
        {gameOver && <PostGameCapture score={score} />}

        {/* Mobile leaderboard below */}
        <div className="block md:hidden mt-4">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

// ── Depth 5 wrapper ──
export default function Depth5Roblox() {
  const ref = useDepthVisibility(5);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center text-center px-4 gap-4 pointer-events-none"
      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
    >
      <p className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-white max-w-md drop-shadow-md">
        BLUEPRINT THE GAME, EVERY ROUTE IS A CASH ROUTE
      </p>
      <div className="pointer-events-auto">
        <EndlessRunner />
      </div>
    </div>
  );
}
