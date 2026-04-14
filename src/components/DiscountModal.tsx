"use client";

import { useDiscount } from "@/contexts/DiscountContext";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function DiscountModal() {
  const { revealed, code, close } = useDiscount();
  const { addDiscount, openCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  if (!revealed || !code) return null;

  async function copy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function claim() {
    if (!code) return;
    setApplying(true);
    try {
      await addDiscount(code);
    } finally {
      setApplying(false);
      close();
      openCart();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative border border-white max-w-md w-full p-8 bg-black flex flex-col gap-6">
        <button
          onClick={close}
          className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white"
        >
          Close
        </button>

        <div className="flex flex-col gap-2 border-b border-white/20 pb-4">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40">
            Transmission Unlocked
          </span>
          <h2 className="font-mono text-2xl font-bold tracking-[0.15em] uppercase">
            Artifact Claimed
          </h2>
          <p className="font-mono text-[11px] text-white/60 leading-relaxed">
            Threshold reached. A discount artifact has been forged. 15% off Handout
            physical merch.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            Code
          </span>
          <button
            onClick={copy}
            className="border border-white/60 py-4 font-mono text-xl tracking-[0.3em] font-bold text-center hover:bg-white hover:text-black transition-colors"
          >
            {copied ? "COPIED" : code}
          </button>
        </div>

        <button
          onClick={claim}
          disabled={applying}
          className="border border-white py-4 font-mono text-xs tracking-widest uppercase font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-40"
        >
          {applying ? "Applying..." : "Claim Artifact"}
        </button>
      </div>
    </div>
  );
}
