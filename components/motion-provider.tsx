"use client";

import { domMax, LazyMotion } from "motion/react";

/**
 * LazyMotion with the `domMax` bundle: domAnimation plus layout projection (the
 * `layout` prop and `AnimatePresence mode="popLayout"` the product search grid
 * uses to reposition cards on filter changes). Mount once high in the tree
 * (app/layout.tsx); use the `m` component, not `motion`, inside it.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}
