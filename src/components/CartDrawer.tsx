"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import { getProducts, ShopifyProduct } from "@/lib/shopify";
import { gsap } from "gsap";

const UPSELL_MATCH = /long\s*sleeve/i;
const TEE_TRIGGER = /tee/i;

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, swapLine, addItem, checkout } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [upsellBusy, setUpsellBusy] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch((err) => console.error("upsell catalog:", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: "auto" });
      document.body.style.overflow = "hidden";
    } else {
      gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power3.inOut" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: "none" });
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const lines = cart?.lines.nodes ?? [];
  const upsellProduct = products.find((p) => UPSELL_MATCH.test(p.title));
  const upsellVariant = upsellProduct?.variants.nodes[0];
  const teeLine = lines.find(
    (l) => TEE_TRIGGER.test(l.merchandise.product.title) && !UPSELL_MATCH.test(l.merchandise.product.title),
  );
  const alreadyHasUpsell = lines.some((l) => UPSELL_MATCH.test(l.merchandise.product.title));
  const showUpsell = !!upsellVariant && !!teeLine && !alreadyHasUpsell;

  const handleUpgrade = async () => {
    if (!upsellVariant || !teeLine) return;
    setUpsellBusy(true);
    try {
      await swapLine(teeLine.id, upsellVariant.id);
    } finally {
      setUpsellBusy(false);
    }
  };

  const handleUpsellAdd = async () => {
    if (!upsellVariant) return;
    setUpsellBusy(true);
    try {
      await addItem(upsellVariant.id, 1);
    } finally {
      setUpsellBusy(false);
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        onClick={closeCart}
        className="fixed inset-0 z-[100] bg-black/80 opacity-0 pointer-events-none transition-opacity"
      />

      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md z-[101] bg-black border-l border-white/20 translate-x-full flex flex-col shadow-2xl"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex flex-col">
            <h2 className="font-mono text-lg font-bold tracking-[0.2em] uppercase text-white">CART</h2>
            <p className="font-mono text-[9px] tracking-widest uppercase text-white/40">
              {cart?.totalQuantity || 0} ITEMS // READY FOR TRANSIT
            </p>
          </div>
          <button
            onClick={closeCart}
            className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {lines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center opacity-30">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-6 h-6">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/60">CART IS EMPTY</p>
            </div>
          ) : (
            lines.map((line) => {
              const img = line.merchandise.image || line.merchandise.product.featuredImage;
              return (
                <div key={line.id} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-white/5 border border-white/10 shrink-0 relative overflow-hidden">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.altText || line.merchandise.product.title}
                        fill
                        sizes="80px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] text-white/10 uppercase">
                        ID-{line.id.slice(-4)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                          {line.merchandise.product.title}
                        </h3>
                        <button
                          onClick={() => removeItem(line.id)}
                          className="font-mono text-[9px] text-white/30 hover:text-red-500 transition-colors shrink-0"
                        >
                          REMOVE
                        </button>
                      </div>
                      <div className="inline-flex items-center border border-white/20 w-fit">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          className="w-7 h-7 font-mono text-sm text-white/70 hover:bg-white hover:text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-mono text-[11px] text-white">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          className="w-7 h-7 font-mono text-sm text-white/70 hover:bg-white hover:text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-white/60 self-end">
                      {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart && lines.length > 0 && (
          <div className="border-t border-white/20">
            {showUpsell && upsellProduct && upsellVariant && (
              <div className="p-5 border-b border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/60">
                    UPGRADE YOUR ARTIFACT
                  </span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-white/5 border border-white/10 shrink-0 relative overflow-hidden">
                    {upsellProduct.featuredImage ? (
                      <Image
                        src={upsellProduct.featuredImage.url}
                        alt={upsellProduct.featuredImage.altText || upsellProduct.title}
                        fill
                        sizes="64px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                          {upsellProduct.title}
                        </span>
                        <span className="font-mono text-[11px] text-white font-bold">
                          {formatMoney(upsellVariant.price.amount, upsellVariant.price.currencyCode)}
                        </span>
                      </div>
                      <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-1">
                        PREMIUM // HEAVYWEIGHT
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        disabled={upsellBusy}
                        onClick={handleUpgrade}
                        className="flex-1 py-2 bg-white text-black font-mono text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors disabled:opacity-40"
                      >
                        {upsellBusy ? "SWAPPING..." : "UPGRADE TO LONG SLEEVE"}
                      </button>
                      <button
                        disabled={upsellBusy}
                        onClick={handleUpsellAdd}
                        className="px-3 py-2 border border-white/30 text-white font-mono text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        aria-label="Add long sleeve"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-white/[0.02]">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">SUBTOTAL</span>
                  <span className="font-mono text-sm text-white">
                    {formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="font-mono text-[10px] text-white uppercase tracking-[0.2em] font-bold">TOTAL ESTIMATE</span>
                  <span className="font-mono text-lg text-white font-bold">
                    {formatMoney(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                  </span>
                </div>
              </div>
              <button
                onClick={checkout}
                className="w-full py-4 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors active:scale-[0.98]"
              >
                INITIALIZE CHECKOUT
              </button>
              <p className="mt-4 font-mono text-[8px] text-center text-white/20 uppercase tracking-widest">
                SECURE TRANSIT VIA SHOPIFY
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
