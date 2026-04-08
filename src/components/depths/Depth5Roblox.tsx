"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDepthVisibility } from "@/hooks/useDepthVisibility";

const CANVAS_W = 600;
const CANVAS_H = 150;
const GROUND_Y = 120;
const PLAYER_SIZE = 20;
const OBSTACLE_W = 14;
const OBSTACLE_H = 28;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const GAME_SPEED_INIT = 4;
const SPEED_INCREMENT = 0.002;

function EndlessRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    velocityY: 0,
    jumping: false,
    obstacles: [] as { x: number; h: number }[],
    score: 0,
    gameOver: false,
    speed: GAME_SPEED_INIT,
    frameCount: 0,
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
      s.speed = GAME_SPEED_INIT;
      s.frameCount = 0;
      setGameOver(false);
      setScore(0);
      return;
    }
    if (!s.jumping) {
      s.velocityY = JUMP_FORCE;
      s.jumping = true;
    }
  }, []);

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

        // Obstacles
        s.frameCount++;
        s.speed += SPEED_INCREMENT;
        if (s.frameCount % Math.max(60, Math.floor(120 - s.score)) === 0) {
          const h = OBSTACLE_H + Math.random() * 12;
          s.obstacles.push({ x: CANVAS_W, h });
        }

        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          s.obstacles[i].x -= s.speed;
          if (s.obstacles[i].x + OBSTACLE_W < 0) {
            s.obstacles.splice(i, 1);
            s.score++;
            setScore(s.score);
          }
        }

        // Collision
        const px = 40;
        const py = s.playerY;
        for (const obs of s.obstacles) {
          if (
            px + PLAYER_SIZE > obs.x &&
            px < obs.x + OBSTACLE_W &&
            py + PLAYER_SIZE > GROUND_Y - obs.h
          ) {
            s.gameOver = true;
            setGameOver(true);
            break;
          }
        }
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground line
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      // Player
      ctx.fillStyle = "#fff";
      ctx.fillRect(40, s.playerY, PLAYER_SIZE, PLAYER_SIZE);

      // Obstacles
      for (const obs of s.obstacles) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(obs.x, GROUND_Y - obs.h, OBSTACLE_W, obs.h);
      }

      // Game over text
      if (s.gameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("[ TAP TO RETRY ]", CANVAS_W / 2, GROUND_Y + 25);
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-between w-full max-w-[600px] px-1">
        <span className="font-mono text-[10px] tracking-wider text-white/40">
          SCORE: {score}
        </span>
        <span className="font-mono text-[10px] tracking-wider text-white/40">
          {gameOver ? "GAME OVER" : "SPACE / TAP TO JUMP"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={jump}
        onTouchStart={jump}
        className="border border-white/20 cursor-pointer max-w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

export default function Depth5Roblox() {
  const ref = useDepthVisibility(5);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6"
    >
      <p className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-white/60 max-w-md">
        BLUEPRINT THE GAME, EVERY ROUTE IS A CASH ROUTE
      </p>
      <div className="pointer-events-auto">
        <EndlessRunner />
      </div>
    </div>
  );
}
