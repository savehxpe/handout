"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth1Transmission() {
  const ref = useDepthVisibility(1);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6"
    >
      <h1 className="font-mono text-sm md:text-lg tracking-[0.3em] uppercase text-white">
        [ TRANSMISSION INTERCEPTED: HANDOUT REMIX FT. FREDDIE GIBBS ]
      </h1>
      <p className="font-mono text-xs md:text-sm text-white/60 max-w-md tracking-wider">
        Outworld transmission intercepted: the Handout frequency is bleeding
        through the silence.
      </p>
    </div>
  );
}
