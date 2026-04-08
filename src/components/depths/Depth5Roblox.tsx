"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth5Roblox() {
  const ref = useDepthVisibility(5);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4"
    >
      <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-white/60">
        [ OUTWORLD SYSTEM DETECTED: PLANET MERCURY ENVIRONMENT LOADING... ]
      </p>
    </div>
  );
}
