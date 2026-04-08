"use client";

import { useState, useEffect } from "react";

export default function TransmissionModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 45_000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/90 backdrop-blur-sm pointer-events-auto">
      <div className="relative bg-black border border-white p-8 md:p-12 max-w-md w-full mx-4">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-4 font-mono text-sm text-white/60 hover:text-white transition-colors"
        >
          X
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-white">
              TRANSMISSION RECEIVED
            </p>
            <p className="font-mono text-[10px] tracking-wider text-white/50">
              You are now part of the Outworld registry.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-mono text-sm md:text-base tracking-[0.3em] uppercase text-white font-bold">
              INCOMING TRANSMISSION
            </p>
            <p className="font-mono text-[10px] tracking-wider text-white/50 leading-relaxed max-w-xs">
              Join the Outworld registry for priority access to future drops and archives.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
                required
                className="bg-transparent border border-white/30 px-4 py-3 font-mono text-[10px] tracking-wider text-white placeholder-white/25 outline-none focus:border-white transition-colors w-full"
              />
              <button
                type="submit"
                className="font-mono text-[10px] tracking-[0.3em] uppercase bg-white text-black px-6 py-3 font-bold transition-colors hover:bg-transparent hover:text-white border border-white"
              >
                INITIATE
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
