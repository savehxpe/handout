"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth1Transmission() {
  const ref = useDepthVisibility(1);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4"
    >
      <h1 className="font-mono text-4xl md:text-7xl font-bold tracking-tight uppercase text-white">
        HANDOUT REMIX
      </h1>
      <h2 className="font-mono text-xl md:text-3xl font-bold tracking-wide uppercase text-white">
        FT. FREDDIE GIBBS
      </h2>
      <p className="font-mono text-[10px] md:text-xs text-white/50 max-w-sm tracking-wider mt-4 leading-relaxed">
        Handout frequency is bleeding through silence... removing transmission.
      </p>
      <p className="font-mono text-[10px] md:text-xs text-white/30 max-w-xs tracking-wider italic leading-relaxed">
        They want a handout, I gave &apos;em a hand up<br />
        Built it from the ground, now they don&apos;t understand us
      </p>
    </div>
  );
}
