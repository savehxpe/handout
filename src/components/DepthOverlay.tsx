"use client";

import { useRef } from "react";
import Depth1Transmission from "./depths/Depth1Transmission";
import Depth2PreSave from "./depths/Depth2PreSave";
import Depth3Video from "./depths/Depth3Video";
import Depth4Social from "./depths/Depth4Social";
import Depth5Roblox from "./depths/Depth5Roblox";
import { SCROLL_HEIGHT } from "@/lib/constants";

export default function DepthOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center"
    >
      <Depth1Transmission />
      <Depth2PreSave />
      <Depth3Video />
      <Depth4Social />
      <Depth5Roblox />
    </div>
  );
}
