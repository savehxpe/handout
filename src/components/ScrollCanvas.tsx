"use client";

import { useRef, useEffect, useCallback } from "react";
import { useParallax } from "@/hooks/useParallax";
import { drawFrame } from "@/lib/canvas";
import { TOTAL_FRAMES } from "@/lib/constants";

const LERP_SPEED = 0.08;

interface ScrollCanvasProps {
  images: React.RefObject<HTMLImageElement[]>;
}

export default function ScrollCanvas({ images }: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);

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

  // Map scroll position to target frame index
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      targetFrameRef.current = Math.min(
        Math.floor(progress * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Render loop: lerp current frame toward target for smooth glide
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick() {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      // Lerp toward target; snap when close enough
      if (Math.abs(diff) > 0.1) {
        currentFrameRef.current += diff * LERP_SPEED;
      } else {
        currentFrameRef.current = target;
      }

      const frameIndex = Math.round(currentFrameRef.current);
      drawFrame(ctx!, images.current, frameIndex, canvas!, mouse.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images, mouse]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
    />
  );
}
