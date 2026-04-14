import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { DiscountProvider } from "@/contexts/DiscountContext";
import CartDrawer from "@/components/CartDrawer";
import DiscountModal from "@/components/DiscountModal";

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
      <body className="min-h-full bg-black text-white font-mono noise-bg">
        <AuthProvider>
          <CartProvider>
            <DiscountProvider>
              {children}
              <CartDrawer />
              <DiscountModal />
            </DiscountProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
