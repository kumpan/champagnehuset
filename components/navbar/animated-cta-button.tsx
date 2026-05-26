"use client";

import type { LinkField } from "@prismicio/client";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";

export interface CtaLinkItem {
  cta_link: LinkField;
  icon?: string | null;
  show_on_mobile?: boolean;
  alternate_text?: string | null;
}

export function AnimatedCTAText({ primary, alternate }: { primary: string; alternate?: string | null }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!alternate) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % 2), 5000);
    return () => clearInterval(id);
  }, [alternate]);

  if (!alternate) return <span>{primary}</span>;

  const texts = [primary, alternate];

  return (
    <div className="relative inline-grid">
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {primary}
      </span>
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {alternate}
      </span>
      <div className="col-start-1 row-start-1 overflow-hidden text-center">
        <AnimatePresence mode="popLayout">
          <m.div
            key={index}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{
              y: { type: "spring", stiffness: 300, damping: 12 },
              opacity: { duration: 0.3, ease: "easeInOut" },
            }}
          >
            {texts[index]}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
