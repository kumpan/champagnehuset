"use client";

import { isFilled } from "@prismicio/client";
import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import CustomMedia from "@/components/custom-media";
import { CustomRichText } from "@/components/custom-rich-text";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { useModal } from "@/components/modal-context";
import { t } from "@/lib/i18n";
import type { NewsletterDocument } from "@/prismicio-types";

/**
 * Newsletter pop-up. Coordinated by the ModalProvider: only surfaces off the
 * landing page, after the configured browsing delay, and once the age gate and
 * cookie banner are resolved. Closable via the backdrop, the X, or Escape.
 */
export function NewsletterModal({ prismicData }: { prismicData: NewsletterDocument }) {
  const { active, dismissNewsletter, markNewsletterSeen } = useModal();
  const open = active === "newsletter";

  const { tagline, title, description, image, email_label, email_placeholder, button_label, success_message } =
    prismicData.data;

  const hasImage = isFilled.image(image);

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
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {/* Backdrop, allowing click to close */}
          <button
            type="button"
            aria-label={t(prismicData.lang).close}
            onClick={dismissNewsletter}
            className="absolute inset-0 cursor-default bg-fill-dark/70 backdrop-blur-sm"
          />

          <m.div
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2 bg-fill shadow-float lg:max-w-256 lg:flex-row"
            initial={{ y: "2rem", scale: 0.92 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "1rem", scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {hasImage && (
              <div className="relative aspect-video w-full shrink-0 lg:order-last lg:aspect-square lg:w-1/2">
                <CustomMedia imageField={image} className="h-full w-full rounded-none" preload />
              </div>
            )}

            <div className="flex flex-col gap-4 p-6 lg:w-1/2 lg:justify-center lg:gap-6 lg:p-12 2xl:p-16">
              <div className="flex flex-col gap-1">
                {isFilled.keyText(tagline) && <span className="font-medium text-base">{tagline}</span>}
                {isFilled.richText(title) && (
                  <CustomRichText field={title} className="text-2xl leading-snug md:text-3xl" inheritSize />
                )}
                {isFilled.richText(description) && <CustomRichText field={description} />}
              </div>

              <NewsletterForm
                layout="stacked"
                emailLabel={email_label}
                placeholder={email_placeholder}
                buttonLabel={button_label}
                buttonIcon
                successMessage={success_message}
                lang={prismicData.lang}
                sectionTheme="Bud"
                source="modal"
                onSubscribed={markNewsletterSeen}
              />
            </div>

            <button
              type="button"
              aria-label={t(prismicData.lang).close}
              onClick={dismissNewsletter}
              className="absolute top-3 right-3 z-60 cursor-pointer rounded-1 bg-fill/80 p-3 text-ink backdrop-blur-sm transition-colors hover:bg-fill/60"
            >
              <X className="size-5" />
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
