"use client";

import { useRef } from "react";
import Link from "next/link";
import { useFrameSequence } from "@/hooks/useFrameSequence";
import { ScrollContainerProvider } from "@/contexts/ScrollContainerContext";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollCanvas from "@/components/ScrollCanvas";
import DepthOverlay from "@/components/DepthOverlay";
import SpinningLogo from "@/components/SpinningLogo";
import AudioTrigger from "@/components/AudioTrigger";
import TransmissionModal from "@/components/TransmissionModal";
import LockedDepths from "@/components/LockedDepths";

export default function Home() {
  const { images, progress } = useFrameSequence();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContainerProvider value={scrollContainerRef}>
      <LoadingScreen progress={progress} />
      <AudioTrigger />
      <SpinningLogo />
      <ScrollCanvas images={images} />
      <div ref={scrollContainerRef} style={{ height: "400vh" }} className="relative" />
      <DepthOverlay />
      <TransmissionModal />
      <div style={{ height: "100vh" }} className="relative" />
      <LockedDepths />
      <footer className="relative z-10 py-8 text-center flex flex-col items-center gap-3">
        <div className="flex gap-6 font-mono text-[10px] tracking-[0.3em] uppercase">
          <Link href="/sounds" className="text-white/50 hover:text-white transition-colors">Sounds</Link>
          <Link href="/archive" className="text-white/50 hover:text-white transition-colors">Archive</Link>
        </div>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
          &copy; 2026 OUTWORLD LLC
        </p>
      </footer>
    </ScrollContainerProvider>
  );
}
