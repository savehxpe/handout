"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOTAL_FRAMES } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export function useScrollFrame(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameIndex = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        frameIndex.current = Math.min(
          Math.floor(self.progress * TOTAL_FRAMES),
          TOTAL_FRAMES - 1
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, [containerRef]);

  return frameIndex;
}
