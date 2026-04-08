"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import { useParallax } from "@/hooks/useParallax";
import { drawFrame } from "@/lib/canvas";
import { SCROLL_HEIGHT } from "@/lib/constants";

interface ScrollCanvasProps {
  images: React.RefObject<HTMLImageElement[]>;
}

export default function ScrollCanvas({ images }: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const frameIndex = useScrollFrame(containerRef);
  const mouse = useParallax();

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick() {
      const imgs = images.current;
      const idx = frameIndex.current;
      drawFrame(ctx!, imgs, idx, canvas!, mouse.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images, frameIndex, mouse]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
      />
      <div
        ref={containerRef}
        style={{ height: SCROLL_HEIGHT }}
        className="relative"
      />
    </>
  );
}
