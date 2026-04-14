"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

// ── Depth 5 wrapper ──
export default function Depth5Roblox() {
  const ref = useDepthVisibility(5);

  return <div ref={ref} className="hidden" />;
}
