"use client";

import { useFrameSequence } from "@/hooks/useFrameSequence";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollCanvas from "@/components/ScrollCanvas";
import DepthOverlay from "@/components/DepthOverlay";
import SpinningLogo from "@/components/SpinningLogo";
import AudioTrigger from "@/components/AudioTrigger";
import TransmissionModal from "@/components/TransmissionModal";

export default function Home() {
  const { images, progress } = useFrameSequence();

  return (
    <>
      <LoadingScreen progress={progress} />
      <AudioTrigger />
      <SpinningLogo />
      <ScrollCanvas images={images} />
      <DepthOverlay />
      <TransmissionModal />
      <footer className="relative z-10 py-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
          &copy; 2026 OUTWORLD LLC
        </p>
      </footer>
    </>
  );
}
