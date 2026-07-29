"use client";

import { isFilled, type RichTextField } from "@prismicio/client";
import { ArrowRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button, type ButtonVariant } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import type { SectionTheme } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import { Input } from "./input";

type FormState = "initial" | "submitting" | "submitted" | "failed";

export type NewsletterConsentItem = {
  text: RichTextField;
  required: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  layout?: "inline" | "stacked";
  emailLabel?: string | null;
  placeholder?: string | null;
  buttonLabel?: string | null;
  successMessage?: RichTextField;
  consentItems?: NewsletterConsentItem[];
  sectionTheme?: SectionTheme;
  buttonVariant?: ButtonVariant;
  buttonIcon?: boolean;
  className?: string;
  onSubscribed?: () => void;
};

export function NewsletterForm({
  layout = "inline",
  emailLabel,
  placeholder,
  buttonLabel,
  successMessage,
  consentItems = [],
  sectionTheme = "Bud",
  buttonVariant = "default",
  buttonIcon = false,
  className,
  onSubscribed,
}: Props) {
  const [formState, setFormState] = useState<FormState>("initial");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentValues, setConsentValues] = useState<Record<number, boolean>>({});
  const [consentErrors, setConsentErrors] = useState<Record<number, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const submitting = formState === "submitting";
  const submitted = formState === "submitted";
  const showErrors = formState === "failed";

  const validate = (): boolean => {
    const nextEmailError = EMAIL_RE.test(email.trim()) ? null : "Please enter a valid email address";
    const nextConsentErrors: Record<number, string> = {};
    consentItems.forEach((item, i) => {
      if (item.required && !consentValues[i]) nextConsentErrors[i] = "This consent is required";
    });
    setEmailError(nextEmailError);
    setConsentErrors(nextConsentErrors);
    return !nextEmailError && Object.keys(nextConsentErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    if (!validate()) {
      setFormState("failed");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), website: honeypot }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setFormState("submitted");
      onSubscribed?.();
    } catch (err) {
      setFormState("failed");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className={cn("w-full", className)}>
        {isFilled.richText(successMessage) ? (
          <CustomRichText field={successMessage} sectionTheme={sectionTheme} />
        ) : (
          <p className="font-medium text-lg">Tack! Kolla din inkorg för att bekräfta.</p>
        )}
      </div>
    );
  }

  const isInline = layout === "inline";

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex w-full flex-col gap-3", className)}>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />

      <div className={cn("flex w-full gap-3", isInline ? "flex-col items-end sm:flex-row" : "flex-col")}>
        <div className="flex w-full flex-1 flex-col gap-1">
          <label htmlFor="newsletter-email" className="font-medium text-base">
            {emailLabel || "E-postadress"}
          </label>
          <Input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={placeholder || "anna@foretag.se"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={showErrors && !!emailError}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          sectionTheme={sectionTheme}
          variant={buttonVariant}
          className={cn(!isInline && "w-full", isInline && "w-full sm:w-auto")}
        >
          {submitting ? "…" : buttonLabel || "Prenumerera nu"}
          {buttonIcon && !submitting && <ArrowRight />}
        </Button>
      </div>

      {showErrors && emailError && <p className="text-error text-sm">{emailError}</p>}

      {/* Optional consent checkboxes */}
      {consentItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {consentItems.map((item, i) =>
            isFilled.richText(item.text) ? (
              <div key={`consent-${i}-${JSON.stringify(item.text[0])}`} className="flex flex-col gap-1">
                <label htmlFor={`newsletter-consent-${i}`} className="flex cursor-pointer items-start gap-2">
                  <Checkbox
                    id={`newsletter-consent-${i}`}
                    name={`newsletter-consent-${i}`}
                    checked={consentValues[i] ?? false}
                    onChange={(e) => setConsentValues((prev) => ({ ...prev, [i]: e.target.checked }))}
                    aria-invalid={showErrors && !!consentErrors[i]}
                    sectionTheme={sectionTheme as "Bud" | "Dust" | undefined}
                  />
                  <span className="text-sm">
                    <CustomRichText field={item.text} sectionTheme={sectionTheme} />
                  </span>
                </label>
                {showErrors && consentErrors[i] && <p className="text-error text-sm">{consentErrors[i]}</p>}
              </div>
            ) : null,
          )}
        </div>
      )}

      {errorMessage && <p className="text-error text-sm">{errorMessage}</p>}
    </form>
  );
}
