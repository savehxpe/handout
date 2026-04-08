"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth5Roblox() {
  const ref = useDepthVisibility(5);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6"
    >
      <h2 className="font-mono text-sm md:text-lg tracking-[0.3em] uppercase text-white">
        [ OUTWORLD SYSTEM DETECTED. PLANET: MERCURY ]
      </h2>
      <a
        href="#"
        className="pointer-events-auto font-mono text-sm tracking-[0.2em] uppercase border border-white px-8 py-3 text-white transition-colors duration-200 hover:bg-white hover:text-black"
      >
        INITIATE ROBLOX CONNECTION
      </a>
    </div>
  );
}
