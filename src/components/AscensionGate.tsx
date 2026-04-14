"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AscensionGate() {
  const { user, loading, isAscended, isNewUser, emailSent, signInWithGoogle } = useAuth();
  const [tier, setTier] = useState<"standard" | "premium">("standard");
  const [processing, setProcessing] = useState(false);

  if (loading) {
    return (
      <section className="relative z-10 py-12 flex items-center justify-center pointer-events-none">
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/40 animate-pulse">
          ESTABLISHING SECURE CONNECTION...
        </span>
      </section>
    );
  }

  // New user — email dispatched, show locked screen
  if (user && isNewUser && emailSent) {
    return (
      <section className="relative z-10 min-h-screen flex items-center justify-center bg-black border-t border-white/10 px-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-7 h-7 text-white/60">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13L2 4" />
            </svg>
          </div>
          <p className="font-mono text-sm tracking-[0.2em] uppercase text-white leading-relaxed">
            SECURE TRANSMISSION SENT. CHECK YOUR EMAIL TO ACCESS THE VAULT.
          </p>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
            DISPATCHED TO {user.email}
          </p>
        </div>
      </section>
    );
  }

  if (isAscended) {
    return (
      <section className="relative z-10 py-20 flex flex-col items-center justify-center bg-black border-t border-white/10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="font-mono text-sm tracking-[0.2em] uppercase text-white">
            ACCESS GRANTED
          </p>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            SCROLL TO ENTER THE OUTWORLD
          </span>
        </div>
      </section>
    );
  }

  async function handleCheckout() {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          uid: user.uid,
          email: user.email || "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[Checkout] No URL returned:", data);
      }
    } catch (err) {
      console.error("[Checkout] Failed:", err);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center bg-black border-t border-white/10 px-6 py-20">
      <div className="flex flex-col items-center gap-8 max-w-lg w-full">
        {/* Title */}
        <div className="text-center flex flex-col gap-3">
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white">
            ASCENSION GATE
          </h2>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/50">
            SECURE PAYMENT GATEWAY // V.2.0.4
          </p>
        </div>

        {/* Unauthenticated state */}
        {!user && (
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="font-mono text-xs tracking-wider text-white/60 text-center max-w-xs leading-relaxed">
              CONNECT YOUR IDENTITY TO BEGIN THE ASCENSION PROTOCOL
            </p>
            <button
              onClick={signInWithGoogle}
              className="w-full max-w-xs py-4 font-mono text-xs uppercase tracking-[0.2em] border border-white text-white transition-colors duration-200 hover:bg-white hover:text-black"
            >
              SIGN IN WITH GOOGLE
            </button>
          </div>
        )}

        {/* Authenticated but not ascended */}
        {user && !isAscended && (
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="font-mono text-[10px] tracking-wider text-white/60 text-center">
              IDENTITY VERIFIED: {user.email}
            </p>

            {/* Tier selector */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => setTier("standard")}
                className={`flex flex-col gap-2 p-4 border transition-colors ${
                  tier === "standard"
                    ? "border-white bg-white/5"
                    : "border-white/20 hover:border-white/50"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  Tier 1
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  The Outsiders
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  $3.50
                </span>
                <ul className="flex flex-col gap-1 mt-2">
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + 1,000 CR/Month
                  </li>
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + 1.5x XP Multiplier
                  </li>
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + Full Vault Access
                  </li>
                </ul>
              </button>

              <button
                onClick={() => setTier("premium")}
                className={`flex flex-col gap-2 p-4 border transition-colors ${
                  tier === "premium"
                    ? "border-white bg-white/5"
                    : "border-white/20 hover:border-white/50"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  Tier 2
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Outworld Premium
                </span>
                <span className="font-mono text-lg font-bold text-white">
                  $5.60
                </span>
                <ul className="flex flex-col gap-1 mt-2">
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + Unlimited Credits
                  </li>
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + 3x XP Multiplier
                  </li>
                  <li className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                    + Exclusive Drops
                  </li>
                </ul>
              </button>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] bg-white text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-40"
            >
              {processing ? "PROCESSING..." : "AUTHORIZE ASCENSION"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
