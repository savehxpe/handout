"use client";

function OutworldSymbol() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="w-10 h-10 md:w-12 md:h-12"
    >
      {/* Outer diamond */}
      <polygon points="32,2 62,32 32,62 2,32" />
      {/* Inner diamond */}
      <polygon points="32,14 50,32 32,50 14,32" />
      {/* Central cross lines */}
      <line x1="32" y1="2" x2="32" y2="62" />
      <line x1="2" y1="32" x2="62" y2="32" />
      {/* Diagonal tribal accents */}
      <line x1="17" y1="17" x2="47" y2="47" />
      <line x1="47" y1="17" x2="17" y2="47" />
      {/* Inner eye / focal point */}
      <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SpinningLogo() {
  return (
    <div className="fixed top-6 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none">
      <div className="animate-spin-slow-3d text-white/70">
        <OutworldSymbol />
      </div>
      <span className="font-mono text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/50">
        SAVEHXPE
      </span>
    </div>
  );
}
