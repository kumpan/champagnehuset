"use client";

import { asText, type Content, isFilled } from "@prismicio/client";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/button";
import { CustomRichText } from "@/components/custom-rich-text";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Textarea } from "./textarea";

type DynamicField = Content.TextSliceFormItem;
type ConsentItem = Content.TextSliceFormPrimaryConsentItemsItem;

type FormState = "initial" | "submitting" | "submitted" | "failed";

function validateField(field: DynamicField, value: string): string | null {
  if (field.field_required && !value.trim()) {
    return `${field.field_label || "This field"} is required`;
  }
  if (!value.trim()) return null;

  switch (field.field_type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Please enter a valid email address";
    case "phone":
      return value.trim().length >= 5 ? null : "Please enter a valid phone number";
    case "name":
      return value.trim().length >= 2 ? null : "Name must be at least 2 characters";
    case "textarea":
      return value.trim().length >= 10 ? null : "Message must be at least 10 characters";
    default:
      return null;
  }
}

// Groups flat field array into rows based on the new_row flag
// new_row: true (default) → field starts a new row
// new_row: false → field is appended to the previous row, side by side
function groupIntoRows(fields: DynamicField[]): DynamicField[][] {
  const rows: DynamicField[][] = [];
  for (const field of fields) {
    if (rows.length === 0 || field.new_row) {
      rows.push([field]);
    } else {
      rows[rows.length - 1].push(field);
    }
  }
  return rows;
}

type Props = {
  className?: string;
  sectionTheme?: string;
  fields?: DynamicField[];
  consentItems?: ConsentItem[];
  submit_button_text?: string | null;
  success_message?: Content.TextSliceFormPrimary["success_message"];
  children?: React.ReactNode;
};

export default function ContactForm({
  className,
  sectionTheme,
  fields = [],
  consentItems = [],
  submit_button_text = "Send message",
  success_message,
  children,
}: Props) {
  const [formState, setFormState] = useState<FormState>("initial");
  const [formValues, setFormValues] = useState<Record<number, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string>>({});
  const [consentValues, setConsentValues] = useState<Record<number, boolean>>({});
  const [consentErrors, setConsentErrors] = useState<Record<number, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const validate = (): boolean => {
    const newFieldErrors: Record<number, string> = {};
    const newConsentErrors: Record<number, string> = {};

    fields.forEach((field, i) => {
      const error = validateField(field, formValues[i] ?? "");
      if (error) newFieldErrors[i] = error;
    });

    consentItems.forEach((item, i) => {
      if (item.consent_required && !consentValues[i]) {
        newConsentErrors[i] = "This consent is required";
      }
    });

    setFieldErrors(newFieldErrors);
    setConsentErrors(newConsentErrors);

    return Object.keys(newFieldErrors).length === 0 && Object.keys(newConsentErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    const valid = validate();
    if (!valid) {
      setFormState("failed");
      firstErrorRef.current?.focus();
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    try {
      const transformedData: Record<string, string> = {};
      const fieldLabels: Record<string, string> = {};

      fields.forEach((field, i) => {
        transformedData[field.field_type] = formValues[i] ?? "";
        fieldLabels[field.field_type] = field.field_label || field.field_type;
      });

      const res = await fetch("/api/contact/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transformedData, fieldLabels }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setFormState("submitted");
    } catch (err) {
      setFormState("failed");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const submitted = formState === "submitted";
  const submitting = formState === "submitting";
  const submittedOnce = formState === "failed";

  const renderField = (field: DynamicField, index: number) => {
    const value = formValues[index] ?? "";
    const error = submittedOnce ? fieldErrors[index] : undefined;

    const handleChange = (val: string) => setFormValues((prev) => ({ ...prev, [index]: val }));

    const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (el && !firstErrorRef.current && submittedOnce && fieldErrors[index]) {
        firstErrorRef.current = el;
      }
    };

    if (field.field_type === "textarea") {
      return (
        <div key={`${field.field_type}-${field.field_label}`} className="flex w-full flex-col gap-1">
          <label htmlFor={`field-${index}`}>{field.field_label}</label>
          <Textarea
            id={`field-${index}`}
            name={`field-${index}`}
            rows={4}
            placeholder={field.field_placeholder ?? undefined}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={2048}
            aria-invalid={!!error}
            required={field.field_required}
            ref={setRef}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      );
    }

    const inputType = field.field_type === "email" ? "email" : field.field_type === "phone" ? "tel" : "text";

    return (
      <div key={index} className="flex w-full flex-col gap-1">
        <label htmlFor={`field-${index}`}>{field.field_label}</label>
        <Input
          id={`field-${index}`}
          name={`field-${index}`}
          type={inputType}
          placeholder={field.field_placeholder ?? undefined}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          aria-invalid={!!error}
          required={field.field_required}
          ref={setRef}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  };

  const rows = groupIntoRows(fields);

  // Track the Original Field Index Per Row for State Keys
  let fieldCursor = 0;

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("relative w-full", className)}>
      {/* Honeypot Anti-Spam */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Success State */}
      {submitted && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {isFilled.richText(success_message) ? (
            <CustomRichText field={success_message} />
          ) : (
            <p className="font-semibold text-xl">Thanks for your message!</p>
          )}
        </div>
      )}

      {/* Form Body */}
      <div className={cn("flex flex-col gap-4", submitted && "hidden")}>
        {children}
        {rows.map((row, i) => {
          const startIndex = fieldCursor;
          fieldCursor += row.length;

          return (
            <div
              key={row.map((f) => `${f.field_type}-${f.field_label}-${i}`).join("|")}
              className={cn("flex gap-4", row.length > 1 ? "flex-row" : "flex-col")}
            >
              {row.map((field, i) => renderField(field, startIndex + i))}
            </div>
          );
        })}

        {/* Consent Checkboxes */}
        {consentItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {consentItems.map((item, i) => (
              <div key={`${i}-${asText(item.consent_text)}`} className="flex flex-col gap-1">
                <label htmlFor={`consent-${i}`} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id={`consent-${i}`}
                    name={`consent-${i}`}
                    checked={consentValues[i] ?? false}
                    onChange={(e) => setConsentValues((prev) => ({ ...prev, [i]: e.target.checked }))}
                    aria-invalid={!!(submittedOnce && consentErrors[i])}
                    sectionTheme={sectionTheme as "Ocean" | "Sunrise" | undefined}
                  />
                  <span>
                    {isFilled.richText(item.consent_text) ? <CustomRichText field={item.consent_text} /> : null}
                  </span>
                </label>
                {submittedOnce && consentErrors[i] && <p className="text-red-600 text-sm">{consentErrors[i]}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : submit_button_text}
        </Button>

        {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
      </div>
    </form>
  );
}
