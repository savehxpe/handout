"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createCart,
  addToCart,
  removeFromCart,
  updateCartLines,
  getCart,
  ShopifyCart,
  applyDiscount,
} from "@/lib/shopify";

type CartContextType = {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isAdding: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  swapLine: (lineId: string, newVariantId: string) => Promise<void>;
  addDiscount: (code: string) => Promise<void>;
  checkout: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const initCart = async () => {
      const savedCartId = localStorage.getItem("shopify_cart_id");
      if (savedCartId) {
        try {
          const cloudCart = await getCart(savedCartId);
          if (cloudCart) {
            setCart(cloudCart);
            return;
          }
        } catch (error) {
          console.error("Failed to fetch existing cart:", error);
        }
      }
      
      // If no valid cart exists, we'll create one on the first "add" action
    };

    initCart();
  }, []);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = async (variantId: string, quantity: number) => {
    setIsAdding(variantId);
    try {
      let currentCart = cart;
      
      if (!currentCart) {
        currentCart = await createCart([{ merchandiseId: variantId, quantity }]);
        localStorage.setItem("shopify_cart_id", currentCart.id);
      } else {
        currentCart = await addToCart(currentCart.id, [{ merchandiseId: variantId, quantity }]);
      }
      
      setCart(currentCart);
      setIsOpen(true); // Automatically open cart when adding
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(null);
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await removeFromCart(cart.id, [lineId]);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    try {
      if (quantity <= 0) {
        const updatedCart = await removeFromCart(cart.id, [lineId]);
        setCart(updatedCart);
        return;
      }
      const updatedCart = await updateCartLines(cart.id, [{ id: lineId, quantity }]);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const swapLine = async (lineId: string, newVariantId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await updateCartLines(cart.id, [
        { id: lineId, merchandiseId: newVariantId },
      ]);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to swap line:", error);
    }
  };

  const addDiscount = async (code: string) => {
    if (!cart) return;
    try {
      const updatedCart = await applyDiscount(cart.id, [code]);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to apply discount:", error);
    }
  };

  const checkout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      isOpen, 
      isAdding,
      openCart, 
      closeCart, 
      addItem,
      removeItem,
      updateQuantity,
      swapLine,
      addDiscount,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
