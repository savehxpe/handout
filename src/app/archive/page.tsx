import Link from "next/link";
import PSAMerchArchive from "@/components/PSAMerchArchive";

export const metadata = {
  title: "PSA Merch Archive · Outworld",
  description: "Recovered artifacts from the Outworld transmission. Limited claims.",
};

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 font-mono text-[10px] tracking-[0.3em] uppercase">
        <Link href="/" className="hover:text-white/70">← Outworld</Link>
        <div className="flex gap-6">
          <Link href="/sounds" className="text-white/50 hover:text-white">Sounds</Link>
          <Link href="/archive" className="text-white">Archive</Link>
        </div>
      </nav>
      <PSAMerchArchive />
    </main>
  );
}
