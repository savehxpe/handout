"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

function PlayIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
      <circle cx="32" cy="32" r="30" stroke="white" strokeWidth="2" />
      <polygon points="26,20 26,44 46,32" fill="white" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export default function Depth3Video() {
  const ref = useDepthVisibility(3);
  const thumbnailUrl = `https://img.youtube.com/vi/mX6J6zzARsI/maxresdefault.jpg`;

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 gap-6 pointer-events-none"
    >
      <a
        href="https://youtu.be/mX6J6zzARsI?si=F4GTlBlbCUfJo9U0"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!window.confirm('Leave the Outworld to watch on YouTube?')) e.preventDefault();
        }}
        className="pointer-events-auto relative z-20 mx-auto max-w-3xl w-full aspect-video block group border border-white/20 overflow-hidden"
      >
        <img
          src={thumbnailUrl}
          alt="Handout Remix — Music Video"
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="transition-transform duration-300 group-hover:scale-110">
            <PlayIcon />
          </div>
        </div>
      </a>

      <div className="flex flex-col items-center gap-2 text-white/40">
        <div className="animate-bounce-down">
          <DownArrow />
        </div>
        <span className="font-mono text-[9px] tracking-[0.4em] uppercase">
          SCROLL TO FOLLOW
        </span>
      </div>
    </div>
  );
}
