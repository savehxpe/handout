"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth3Video() {
  const ref = useDepthVisibility(3);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <div className="pointer-events-auto w-full max-w-3xl aspect-video">
        <iframe
          src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
          title="Handout Remix — Music Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full border border-white/20"
        />
      </div>
    </div>
  );
}
