"use client";

import { useState, useEffect } from "react";

function useCountdown(targetDate: Date) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ d: 0, h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const s = Math.floor(diff / 1000);
      setRemaining({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
        expired: false,
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function OutworldSymbol() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className="w-10 h-10 md:w-12 md:h-12"
      aria-label="saveHXPE"
    >
      <circle cx="24" cy="24" r="22" />
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      <path d="M24 2v8M24 38v8M2 24h8M38 24h8" />
    </svg>
  );
}

// Target: Drop date — Friday, April 17, 2026 at midnight local time
const DROP_DATE = new Date(2026, 3, 17, 0, 0, 0);

export default function SpinningLogo() {
  const { d, h, m, s, expired } = useCountdown(DROP_DATE);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    function onScroll() {
      const vh = window.innerHeight;
      const fadeStart = vh * 3.2;
      const fadeEnd = vh * 4.0;
      const y = window.scrollY;
      if (y <= fadeStart) setOpacity(1);
      else if (y >= fadeEnd) setOpacity(0);
      else setOpacity(1 - (y - fadeStart) / (fadeEnd - fadeStart));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-6 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none transition-opacity duration-200"
      style={{ opacity, visibility: opacity === 0 ? "hidden" : "visible" }}
    >
      <div className="animate-spin-slow-3d text-white/70">
        <OutworldSymbol />
      </div>
      <span className="font-mono text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/50">
        SAVEHXPE
      </span>
      {!expired && (
        <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-white/60">
          {pad(d)} : {pad(h)} : {pad(m)} : {pad(s)}
        </span>
      )}
    </div>
  );
}
