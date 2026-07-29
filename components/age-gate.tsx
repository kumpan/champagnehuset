"use client";

import { isFilled } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { useModal } from "@/components/modal-context";
import type { AgeGateDocument } from "@/prismicio-types";

/**
 * Blocking age gate. Takes over the viewport (dark backdrop, scroll locked) and
 * cannot be dismissed by clicking outside — an active choice is required.
 * "Yes" stores consent and releases the cookie banner; "No" reveals a short
 * message and a link to the CMS page explaining why we ask.
 */
export function AgeGate({ prismicData }: { prismicData: AgeGateDocument }) {
  const { active, confirmAge } = useModal();
  const [declined, setDeclined] = useState(false);
  const open = active === "age";

  const { title, description, confirm_label, decline_label, decline_message, info_link } = prismicData.data;

  // Lock page scroll while the gate is up.
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const previous = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="age-gate"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 selection:bg-brand selection:text-brand-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Backdrop — intentionally not closable */}
          <div className="absolute inset-0 bg-fill-dark/85 backdrop-blur-sm" aria-hidden />

          <m.div
            className="relative w-full max-w-md rounded-2 bg-fill p-6 shadow-float md:p-8"
            initial={{ opacity: 0, y: "2rem", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "1rem", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
          >
            {!declined ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-2">
                  {isFilled.richText(title) && (
                    <CustomRichText field={title} className="text-2xl leading-tight md:text-3xl" inheritSize />
                  )}
                  {isFilled.richText(description) && <CustomRichText field={description} className="text-ink-dim" />}
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button type="button" onClick={confirmAge} className="sm:min-w-32">
                    {confirm_label || "Ja"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDeclined(true)} className="sm:min-w-32">
                    {decline_label || "Nej"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                {isFilled.richText(decline_message) ? (
                  <CustomRichText field={decline_message} className="text-ink-dim" />
                ) : (
                  <p className="text-ink-dim">Du behöver vara 20 år för att besöka sidan.</p>
                )}
                <div className="flex w-full flex-col gap-2">
                  {isFilled.link(info_link) && (
                    <Button asChild>
                      <PrismicNextLink field={info_link}>{info_link.text || "Läs mer"}</PrismicNextLink>
                    </Button>
                  )}
                  <Button type="button" variant="ghost" onClick={() => setDeclined(false)}>
                    Tillbaka
                  </Button>
                </div>
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
