"use client";

export default function SpinningLogo() {
  return (
    <div className="fixed top-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
      <h1 className="animate-spin-slow-3d font-mono text-xs md:text-sm tracking-[0.5em] uppercase text-white/80">
        SAVEHXPE
      </h1>
    </div>
  );
}
