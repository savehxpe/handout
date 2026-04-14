"use client";

import { createContext, useContext, type RefObject } from "react";

const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null>>({
  current: null,
});

export const ScrollContainerProvider = ScrollContainerContext.Provider;

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}
