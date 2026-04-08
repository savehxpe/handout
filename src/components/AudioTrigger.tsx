"use client";

import { useEffect, useRef } from "react";

export default function AudioTrigger() {
  const audioRef = useRef<HTMLIFrameElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    function trigger() {
      if (triggered.current) return;
      triggered.current = true;

      // Activate the hidden YouTube embed to start audio
      const iframe = audioRef.current;
      if (iframe) {
        iframe.src = iframe.dataset.src + "&autoplay=1";
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
    <iframe
      ref={audioRef}
      data-src="https://www.youtube-nocookie.com/embed/mX6J6zzARsI?si=F4GTlBlbCUfJo9U0&enablejsapi=1"
      allow="autoplay; encrypted-media"
      className="hidden"
      title="Background audio"
    />
  );
}
