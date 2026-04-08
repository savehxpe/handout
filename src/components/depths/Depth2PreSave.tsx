"use client";

import { useState } from "react";
import { useDepthVisibility } from "@/hooks/useDepthVisibility";

export default function Depth2PreSave() {
  const ref = useDepthVisibility(2);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 gap-6"
    >
      <a
        href="#"
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto font-mono text-base md:text-lg tracking-[0.2em] uppercase border border-white px-10 py-4 text-white font-bold transition-colors duration-200 hover:bg-white hover:text-black"
      >
        PRE-SAVE TO UNLOCK THE REMIX
      </a>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto flex flex-col sm:flex-row gap-3 items-center mt-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="[ ENTER COMMS LINK ]"
            required
            className="bg-transparent border border-white/40 px-6 py-3 font-mono text-xs tracking-wider text-white placeholder-white/30 outline-none focus:border-white transition-colors w-64"
          />
          <button
            type="submit"
            className="font-mono text-xs tracking-[0.2em] uppercase border border-white px-6 py-3 text-white transition-colors duration-200 hover:bg-white hover:text-black"
          >
            INITIATE
          </button>
        </form>
      ) : (
        <p className="font-mono text-xs tracking-wider text-white/50">
          [ COMMS LINK ESTABLISHED ]
        </p>
      )}
    </div>
  );
}
