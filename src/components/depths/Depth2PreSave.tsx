"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth2PreSave() {
  const ref = useDepthVisibility(2);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-6"
    >
      <p className="font-mono text-xs md:text-sm text-white/60 max-w-md tracking-wider">
        Access restricted. Pre-save immediately to decrypt the Outworld archive
        and unlock the blueprint.
      </p>
      <a
        href="#"
        className="pointer-events-auto font-mono text-sm tracking-[0.2em] uppercase border border-white px-8 py-3 text-white transition-colors duration-200 hover:bg-white hover:text-black"
      >
        PRE-SAVE TO UNLOCK ARCHIVE
      </a>
    </div>
  );
}
