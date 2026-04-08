"use client";

import { useEffect, useRef } from "react";

export default function AudioTrigger() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    function trigger() {
      if (triggered.current) return;
      triggered.current = true;

      const audio = audioRef.current;
      if (audio) {
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }

      window.removeEventListener("click", trigger);
      window.removeEventListener("scroll", trigger);
    }

    window.addEventListener("click", trigger, { once: true });
    window.addEventListener("scroll", trigger, { once: true });
    return () => {
      window.removeEventListener("click", trigger);
      window.removeEventListener("scroll", trigger);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/audio/ambient.mp3"
      loop
      preload="none"
    />
  );
}
