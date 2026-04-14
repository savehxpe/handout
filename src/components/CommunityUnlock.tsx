"use client";

export default function CommunityUnlock() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-white/40">
          INNER CIRCLE PROTOCOL
        </span>
        <h3 className="font-mono text-3xl md:text-5xl font-bold tracking-[0.15em] uppercase text-white leading-tight">
          JOIN THE OUTWORLD
        </h3>
        <p className="font-mono text-xs tracking-widest uppercase text-white/60 max-w-md leading-relaxed">
          ASCEND TO THE INNER CIRCLE TO UNLOCK THE FINAL ARTIFACT.
        </p>
      </div>

      <div className="border border-white/30 bg-black p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="https://discord.gg/dUKMm8Bt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 group relative overflow-hidden border border-white/40 px-8 py-5 font-mono text-xs font-bold tracking-[0.3em] uppercase text-center text-white transition-all duration-300 active:scale-[0.98] hover:border-white hover:bg-white/10"
          >
            <span className="relative z-10">ACCESS DISCORD</span>
            <span className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>

          <a
            href="https://www.instagram.com/channel/AbYMmPKWfjW02bsa/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 group relative overflow-hidden border border-white/40 px-8 py-5 font-mono text-xs font-bold tracking-[0.3em] uppercase text-center text-white transition-all duration-300 active:scale-[0.98] hover:border-white hover:bg-white/10"
          >
            <span className="relative z-10">ACCESS IG CHANNEL</span>
            <span className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
        </div>
      </div>
    </section>
  );
}
