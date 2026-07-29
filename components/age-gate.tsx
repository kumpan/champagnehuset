"use client";

import { isFilled } from "@prismicio/client";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { useModal } from "@/components/modal-context";
import type { AgeGateDocument } from "@/prismicio-types";

export function AgeGate({ prismicData }: { prismicData: AgeGateDocument }) {
  const { active, confirmAge } = useModal();
  const [declined, setDeclined] = useState(false);
  const open = active === "age";

  const { title, description, confirm_label, decline_label, decline_title, decline_message } = prismicData.data;

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
          className="fixed inset-0 z-70 flex items-center justify-center p-4 selection:bg-brand selection:text-brand-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Backdrop, intentionally not closable */}
          <div className="absolute inset-0 bg-fill-dark/90 backdrop-blur-sm" aria-hidden />

          <m.div
            className="relative w-full max-w-88 rounded-2 bg-fill p-4 pt-12 shadow-float sm:max-w-104 md:max-w-128 md:p-8 md:pt-14 lg:max-w-144 lg:p-16"
            initial={{ opacity: 0, y: "2rem", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "1rem", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
          >
            {!declined ? (
              <div className="flex flex-col items-center gap-8 text-center">
                <div>
                  {isFilled.richText(title) && (
                    <CustomRichText
                      field={title}
                      className="text-3xl leading-tight md:text-4xl lg:text-5xl"
                      inheritSize
                    />
                  )}
                  {isFilled.richText(description) && <CustomRichText field={description} />}
                </div>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button type="button" onClick={confirmAge} className="sm:min-w-32">
                    {confirm_label || "Ja"}
                  </Button>
                  <Button type="button" onClick={() => setDeclined(true)} className="sm:min-w-32">
                    {decline_label || "Nej"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8 text-center">
                <div>
                  {isFilled.richText(decline_title) && (
                    <CustomRichText
                      field={decline_title}
                      className="text-3xl leading-tight md:text-4xl lg:text-5xl"
                      inheritSize
                    />
                  )}
                  {isFilled.richText(decline_message) ? (
                    <CustomRichText field={decline_message} />
                  ) : (
                    <p>Du behöver vara 25 år för att besöka sidan.</p>
                  )}
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Button type="button" variant="outline" onClick={() => setDeclined(false)}>
                    <ArrowLeft />
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
