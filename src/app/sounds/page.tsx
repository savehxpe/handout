import Link from "next/link";
import ArtistSpotlight from "@/components/ArtistSpotlight";

export const metadata = {
  title: "saveHXPE · Sounds",
  description: "Transmissions from saveHXPE — streams, previews, discography.",
};

export default function SoundsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 font-mono text-[10px] tracking-[0.3em] uppercase">
        <Link href="/" className="hover:text-white/70">← Outworld</Link>
        <div className="flex gap-6">
          <Link href="/sounds" className="text-white">Sounds</Link>
          <Link href="/archive" className="text-white/50 hover:text-white">Archive</Link>
        </div>
      </nav>
      <ArtistSpotlight />
    </main>
  );
}
