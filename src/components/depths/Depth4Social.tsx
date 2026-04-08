"use client";

import { useDepthVisibility } from "@/hooks/useDepthVisibility";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.18 8.18 0 004.77 1.52V7a4.84 4.84 0 01-1-.31z" />
    </svg>
  );
}

const socials = [
  { icon: InstagramIcon, label: "IG", href: "https://www.instagram.com/savehxpe" },
  { icon: XIcon, label: "X", href: "https://x.com/savehxpe" },
  { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/savehxpe" },
];

export default function Depth4Social() {
  const ref = useDepthVisibility(4);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="flex gap-12 items-center">
        {socials.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex flex-col items-center gap-2 text-white transition-colors duration-200 hover:bg-white hover:text-black p-4"
          >
            <Icon />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
