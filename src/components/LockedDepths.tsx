"use client";

import ArcadeGame from "./ArcadeGame";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function DashboardSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xl font-bold tracking-[0.15em] uppercase text-white">
          COMMAND CENTER
        </h3>
        <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">
          CITIZEN TELEMETRY // REAL-TIME
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1 p-4 border border-white/10">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            XP Level
          </span>
          <span className="font-mono text-2xl font-bold text-white">500</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border border-white/10">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Credits
          </span>
          <span className="font-mono text-2xl font-bold text-white">20 CR</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border border-white/10">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Engagement
          </span>
          <span className="font-mono text-2xl font-bold text-white">54.0</span>
        </div>
        <div className="flex flex-col gap-1 p-4 border border-white/10">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Rank
          </span>
          <span className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            PROXY
          </span>
          <span className="font-mono text-[9px] text-white/30">501 XP to OPERATIVE</span>
        </div>
      </div>
    </section>
  );
}

function VaultSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
      <div className="flex justify-between items-end border-b border-white/20 pb-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-xl font-bold tracking-[0.15em] uppercase text-white">
            THE VAULT
          </h3>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">
            HANDOUT REMIX // EXCLUSIVE CONTENT
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest flex items-center gap-2 text-white/60">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          UNLOCKED
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 p-6 border border-white/20">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 text-white/40">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div>
              <div className="font-mono text-sm font-bold text-white">HANDOUT</div>
              <div className="font-mono text-[10px] text-white/40">VIP MIX</div>
            </div>
            <span className="font-mono text-xs text-white/60">03:42</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className="font-mono text-[10px] border border-white/30 px-2 py-1 self-start">
            WAV // 24BIT
          </div>
          <div className="flex items-center h-20 gap-[2px] overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/60 rounded-full"
                style={{ height: `${15 + Math.random() * 70}%` }}
              />
            ))}
          </div>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
            STREAM COUNT: 0 // FIRST ACCESS
          </p>
        </div>
      </div>
    </section>
  );
}

function ArcadeSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col gap-10">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/40">
          ARTIFACT PROTOCOL
        </span>
        <h3 className="font-mono text-3xl md:text-5xl font-bold tracking-[0.1em] uppercase text-white leading-tight">
          EARN 15% OFF
        </h3>
        <p className="font-mono text-xs tracking-widest uppercase text-white/60 max-w-md leading-relaxed">
          TAP THE ORBS. BREAK 500. FORGE A DISCOUNT ARTIFACT YOU CAN SPEND IN THE CART.
        </p>
      </div>

      <div className="border border-white/30 p-6 md:p-10 bg-white/[0.02]">
        <ArcadeGame />
      </div>
    </section>
  );
}

import MerchVault from "./MerchVault";
import CommunityUnlock from "./CommunityUnlock";
import PSAMerchArchive from "./PSAMerchArchive";

function MerchSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
      <div className="flex justify-between items-end border-b border-white/20 pb-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-xl font-bold tracking-[0.15em] uppercase text-white">
            MERCH
          </h3>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">
            EXCLUSIVE DROPS // SEASON 04
          </p>
        </div>
      </div>

      <MerchVault />
    </section>
  );
}

export default function LockedDepths() {
  return (
    <div className="relative z-10">
      <SectionDivider label="MERCH" />
      <MerchSection />
      <SectionDivider label="ARCADE" />
      <ArcadeSection />
      <SectionDivider label="PSA ARCHIVE" />
      <PSAMerchArchive />
      <SectionDivider label="ASCENSION" />
      <CommunityUnlock />
    </div>
  );
}
