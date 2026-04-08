"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  progress: number;
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Lock scroll while loading
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fade out when fully loaded
  useEffect(() => {
    if (progress < 100) return;

    const el = overlayRef.current;
    if (!el) return;

    gsap.to(el, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.style.overflow = "";
        setVisible(false);
      },
    });
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <p className="font-mono text-white text-xl tracking-widest">
        [ {progress}% ]
      </p>
    </div>
  );
}
