"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth1Transmission() {
  const ref = useDepthVisibility(1);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3"
    >
      <h1 className="font-mono text-5xl md:text-8xl font-bold tracking-tight uppercase text-white">
        HANDOUT REMIX
      </h1>
      <h2 className="font-mono text-xl md:text-3xl font-bold tracking-wide uppercase text-white/80">
        FT. FREDDIE GIBBS
      </h2>
      <p className="font-mono text-[11px] md:text-sm text-white/40 max-w-xs tracking-wider mt-6 italic leading-relaxed">
        My moves is silent like airdrop<br />
        I claim the top spot
      </p>
    </div>
  );
}
