"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type DiscountContextType = {
  code: string | null;
  revealed: boolean;
  reveal: (code?: string) => void;
  close: () => void;
};

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

const defaultCode = process.env.NEXT_PUBLIC_OUTWORLD_DISCOUNT_CODE ?? "OUTWORLD15";

export function DiscountProvider({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const reveal = useCallback((c?: string) => {
    const finalCode = c ?? defaultCode;
    if (typeof window !== "undefined" && localStorage.getItem("outworld_discount_claimed")) {
      return;
    }
    setCode(finalCode);
    setRevealed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("outworld_discount_claimed", finalCode);
    }
  }, []);

  const close = useCallback(() => setRevealed(false), []);

  return (
    <DiscountContext.Provider value={{ code, revealed, reveal, close }}>
      {children}
    </DiscountContext.Provider>
  );
}

export function useDiscount() {
  const ctx = useContext(DiscountContext);
  if (!ctx) throw new Error("useDiscount must be inside DiscountProvider");
  return ctx;
}
