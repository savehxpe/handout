"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DEPTHS } from "@/lib/constants";
import { useScrollContainer } from "@/contexts/ScrollContainerContext";

gsap.registerPlugin(ScrollTrigger);

export function useDepthVisibility(depthId: number) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useScrollContainer();
  const depth = DEPTHS.find((d) => d.id === depthId)!;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = containerRef.current || document.body;

    gsap.set(el, { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: `${depth.start * 100}% top`,
        end: `${depth.end * 100}% top`,
        scrub: true,
      },
    });

    // Fade in during first 30% of range, hold, fade out during last 30%
    tl.to(el, { autoAlpha: 1, duration: 0.3 })
      .to(el, { autoAlpha: 1, duration: 0.4 })
      .to(el, { autoAlpha: 0, duration: 0.3 });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [depth.start, depth.end, containerRef]);

  return ref;
}
