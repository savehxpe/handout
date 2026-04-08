import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OUTWORLD // HANDOUT REMIX",
  description: "Save Hxpe — Handout Remix ft. Freddie Gibbs",
  other: { "theme-color": "#000000" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className="min-h-full bg-black text-white font-mono">
        {children}
      </body>
    </html>
  );
}
