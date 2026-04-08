"use client";

import { useEffect, useRef, useState } from "react";
import { TOTAL_FRAMES } from "@/lib/constants";

const CRITICAL_FRAMES = 15;

export function useFrameSequence() {
  const [progress, setProgress] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));

  useEffect(() => {
    const images = imagesRef.current;
    let criticalLoaded = 0;

    function loadFrame(i: number, onLoad?: () => void) {
      const img = new Image();
      const num = String(i + 1).padStart(3, "0");
      img.src = `/frames/frame-${num}.webp`;
      img.onload = () => {
        images[i] = img;
        onLoad?.();
      };
    }

    // Phase 1: load first 15 frames, drive loading screen progress
    for (let i = 0; i < CRITICAL_FRAMES; i++) {
      loadFrame(i, () => {
        criticalLoaded++;
        setProgress(Math.round((criticalLoaded / CRITICAL_FRAMES) * 100));

        // Phase 2: once critical batch done, kick off background loading
        if (criticalLoaded === CRITICAL_FRAMES) {
          loadBackgroundBatch(CRITICAL_FRAMES);
        }
      });
    }

    // Load remaining frames in small batches to avoid memory pressure
    const BATCH_SIZE = 6;
    function loadBackgroundBatch(startIndex: number) {
      const end = Math.min(startIndex + BATCH_SIZE, TOTAL_FRAMES);
      let batchLoaded = 0;
      for (let i = startIndex; i < end; i++) {
        loadFrame(i, () => {
          batchLoaded++;
          if (batchLoaded === end - startIndex && end < TOTAL_FRAMES) {
            loadBackgroundBatch(end);
          }
        });
      }
    }
  }, []);

  return { images: imagesRef, progress };
}
