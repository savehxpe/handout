"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth2PreSave() {
  const ref = useDepthVisibility(2);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 flex items-center justify-center px-6"
    >
      <a
        href="#"
        className="pointer-events-auto font-mono text-lg md:text-2xl tracking-[0.15em] uppercase border border-white px-12 py-5 text-white font-bold transition-colors duration-200 hover:bg-white hover:text-black"
      >
        PRE-SAVE TO UNLOCK THE REMIX
      </a>
    </div>
  );
}
