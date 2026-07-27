"use client";

import { domMax, LazyMotion } from "motion/react";

/**
 * Wraps children with LazyMotion using the `domMax` feature bundle: everything
 * in `domAnimation` plus layout projection — the `layout` prop and
 * `AnimatePresence mode="popLayout"` used by the product search grid to
 * reposition cards when filters change. Use the `m` component (not `motion`)
 * inside any subtree wrapped by this provider.
 *
 * Place this as high in the tree as needed — typically in app/layout.tsx —
 * so all child components share a single feature bundle load.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
}
