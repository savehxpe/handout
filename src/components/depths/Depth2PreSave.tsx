"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white/60">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export default function Depth2PreSave() {
  const ref = useDepthVisibility(2);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 flex items-center justify-center px-6"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Bouncing arrows above CTA */}
        <div className="flex gap-3 animate-bounce">
          <DownArrow />
          <DownArrow />
        </div>

        <a
          href="#"
          className="pointer-events-auto font-mono text-lg md:text-2xl tracking-[0.15em] uppercase border border-white px-12 py-5 text-white font-bold transition-colors duration-200 hover:bg-white hover:text-black"
        >
          PRE-SAVE TO UNLOCK THE REMIX
        </a>

        {/* Pulsating scroll hint */}
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
          SCROLL TO EXPLORE
        </span>
      </div>
    </div>
  );
}
