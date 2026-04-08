"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth3Video() {
  const ref = useDepthVisibility(3);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-30 flex items-center justify-center px-6"
    >
      <div
        className="pointer-events-auto w-full max-w-3xl aspect-video relative"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src="https://www.youtube-nocookie.com/embed/mX6J6zzARsI?si=F4GTlBlbCUfJo9U0"
          title="Handout Remix — Music Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border border-white/20"
        />
      </div>
    </div>
  );
}
