"use client";

import { useEffect, useState } from "react";
import { getProducts, ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import Image from "next/image";

export default function MerchVault() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const { addItem, isAdding } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product, idx) => {
        const variant = product.variants.nodes[0];
        const isSoldOut = !variant?.availableForSale;
        const price = variant?.price;
        const imageFailed = failed[product.id];

        return (
          <div key={product.id} className="flex flex-col border border-white/20 group hover:border-white/40 transition-colors">
            <button
              type="button"
              disabled={isSoldOut || isAdding === variant?.id}
              onClick={() => variant && addItem(variant.id, 1)}
              aria-label={`Add ${product.title} to cart`}
              className="relative aspect-[4/5] bg-white/5 flex items-center justify-center border-b border-white/10 overflow-hidden disabled:cursor-not-allowed"
            >
              {product.featuredImage && !imageFailed ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  priority={idx < 3}
                  unoptimized
                  onError={() => setFailed((f) => ({ ...f, [product.id]: true }))}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-white/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              )}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-white">SOLD OUT</span>
                </div>
              )}
            </button>
            
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  {product.title}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {price ? formatMoney(price.amount, price.currencyCode) : "TBA"}
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/40 uppercase leading-relaxed line-clamp-2">
                {product.description}
              </p>
              <button
                disabled={isSoldOut || isAdding === variant?.id}
                onClick={() => variant && addItem(variant.id, 1)}
                className={`w-full py-3 font-mono text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                  !isSoldOut
                    ? "border-white text-white hover:bg-white hover:text-black active:scale-[0.98]"
                    : "border-white/20 text-white/30 cursor-not-allowed"
                }`}
              >
                {isAdding === variant?.id ? "SEQUENCING..." : isSoldOut ? "ARCHIVED" : "ADD TO CART"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
