"use client";

import { isFilled } from "@prismicio/client";
import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import CustomMedia from "@/components/custom-media";
import { CustomRichText } from "@/components/custom-rich-text";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { useModal } from "@/components/modal-context";
import type { NewsletterDocument } from "@/prismicio-types";

/**
 * Newsletter pop-up. Coordinated by the ModalProvider: only surfaces off the
 * landing page, after the configured browsing delay, and once the age gate and
 * cookie banner are resolved. Closable via the backdrop, the X, or Escape.
 */
export function NewsletterModal({ prismicData }: { prismicData: NewsletterDocument }) {
  const { active, dismissNewsletter, markNewsletterSeen } = useModal();
  const open = active === "newsletter";

  const {
    tagline,
    title,
    description,
    image,
    email_label,
    email_placeholder,
    button_label,
    success_message,
    consent_text,
  } = prismicData.data;

  const hasImage = isFilled.image(image);
  const consentItems = isFilled.richText(consent_text) ? [{ text: consent_text, required: true }] : [];

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissNewsletter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismissNewsletter]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="newsletter-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-brand selection:text-brand-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Backdrop — click to close */}
          <button
            type="button"
            aria-label="Stäng"
            onClick={dismissNewsletter}
            className="absolute inset-0 cursor-default bg-fill-dark/70 backdrop-blur-sm"
          />

          <m.div
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2 bg-fill shadow-float lg:max-w-3xl lg:flex-row"
            initial={{ opacity: 0, y: "2rem", scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "1rem", scale: 0.96 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
          >
            {hasImage && (
              <div className="relative aspect-video w-full shrink-0 lg:aspect-auto lg:order-last lg:w-1/2">
                <CustomMedia imageField={image} className="h-full w-full rounded-none" preload />
              </div>
            )}

            <div className="flex flex-col gap-4 p-6 lg:w-1/2 lg:justify-center lg:gap-6 lg:p-10">
              <div className="flex flex-col gap-1">
                {isFilled.keyText(tagline) && <span className="font-medium text-base text-ink">{tagline}</span>}
                {isFilled.richText(title) && (
                  <CustomRichText field={title} className="text-xl leading-snug md:text-2xl" inheritSize />
                )}
                {isFilled.richText(description) && <CustomRichText field={description} className="text-ink-dim" />}
              </div>

              <NewsletterForm
                layout="stacked"
                emailLabel={email_label}
                placeholder={email_placeholder}
                buttonLabel={button_label}
                successMessage={success_message}
                consentItems={consentItems}
                sectionTheme="Bud"
                onSubscribed={markNewsletterSeen}
              />
            </div>

            <button
              type="button"
              aria-label="Stäng"
              onClick={dismissNewsletter}
              className="absolute top-3 right-3 z-10 rounded-full bg-fill/70 p-1.5 text-ink backdrop-blur-sm transition-colors hover:bg-fill"
            >
              <X className="size-5" />
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
