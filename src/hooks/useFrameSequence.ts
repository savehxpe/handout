"use client";

import { useEffect, useRef, useState } from "react";
import { TOTAL_FRAMES } from "@/lib/constants";

export function useFrameSequence() {
  const [progress, setProgress] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i + 1).padStart(3, "0");
      img.src = `/frames/frame-${num}.png`;
      img.onload = () => {
        loaded++;
        setProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          imagesRef.current = images;
        }
      };
      images[i] = img;
    }
  }, []);

  return { images: imagesRef, progress };
}
