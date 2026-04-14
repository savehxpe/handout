"use client";

import Image from "next/image";

type Artifact = {
  slug: string;
  name: string;
  caption: string;
  image: string;
};

const ARTIFACTS: Artifact[] = [
  {
    slug: "psa-shirt-black-front",
    name: "PSA Tee — Black (Front)",
    caption: "Save Hxpe for the Future",
    image: "/merch/psa-shirt-black-front-kie.png",
  },
  {
    slug: "psa-shirt-cities-back",
    name: "Cities Tee — Black (Back)",
    caption: "Maseru · NYC · Cape Town · LA · JHB · Chicago",
    image: "/merch/psa-shirt-cities-back-kie.png",
  },
  {
    slug: "psa-shirt-white",
    name: "PSA Tee — White",
    caption: "Protest Graphic",
    image: "/merch/psa-shirt-white-kie.png",
  },
  {
    slug: "psa-hoodie-front",
    name: "PSA Hoodie (Front)",
    caption: "Signature Mark",
    image: "/merch/psa-hoodie-front-kie.png",
  },
  {
    slug: "psa-hoodie-back",
    name: "PSA Hoodie (Back)",
    caption: "Crown Emblem",
    image: "/merch/psa-hoodie-back-kie.png",
  },
];

type Props = {
  onClaim?: (slug: string) => void;
};

export default function PSAMerchArchive({ onClaim }: Props) {
  return (
    <section className="bg-black text-white font-mono px-6 py-16 md:py-24">
      <header className="mb-12 text-center">
        <p className="text-xs tracking-[0.4em] text-white/50">ARCHIVE · 001</p>
        <h2 className="mt-3 text-2xl md:text-4xl tracking-widest">
          PSA MERCH ARCHIVE
        </h2>
        <p className="mt-3 text-xs md:text-sm text-white/60 max-w-md mx-auto">
          Recovered artifacts from the Outworld transmission. Limited claims.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {ARTIFACTS.map((a) => (
          <article
            key={a.slug}
            className="bg-black border border-white/20 hover:border-white/60 transition-colors duration-300 flex flex-col"
          >
            <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
              <Image
                src={a.image}
                alt={a.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain"
              />
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm tracking-widest uppercase">{a.name}</h3>
                <span className="text-[10px] text-white/40">{a.slug.slice(-3).toUpperCase()}</span>
              </div>
              <p className="text-xs text-white/50">{a.caption}</p>

              <button
                type="button"
                onClick={() => onClaim?.(a.slug)}
                className="mt-auto border border-white/20 hover:bg-white hover:text-black transition-colors duration-200 py-3 text-xs tracking-[0.3em] uppercase"
              >
                Claim Artifact
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
