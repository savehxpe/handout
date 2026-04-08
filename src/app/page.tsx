"use client";

import { useFrameSequence } from "@/hooks/useFrameSequence";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollCanvas from "@/components/ScrollCanvas";
import DepthOverlay from "@/components/DepthOverlay";

export default function Home() {
  const { images, progress } = useFrameSequence();

  return (
    <>
      <LoadingScreen progress={progress} />
      <ScrollCanvas images={images} />
      <DepthOverlay />
    </>
  );
}
