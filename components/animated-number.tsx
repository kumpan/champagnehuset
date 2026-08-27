"use client";

import { asText, type RichTextField } from "@prismicio/client";
import { animate, type Easing, useInView } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface AnimatedNumberProps {
  field?: RichTextField;
  valueText?: string;
  size?: "Small" | "Medium" | "Large";
  className?: string;
  durationMs?: number;
  decimals?: number | "auto";
  ease?: Easing;
  numberClassName?: string;
}

function splitTextIntoParts(input: string) {
  // We remove any potential spaces first
  const noSpaces = input.replace(/\s+/g, "");

  // Find first number, while including decimals
  const match = noSpaces.match(/-?[\d.,]+/);
  if (!match) {
    return { prefix: input, numberStr: "", suffix: "" };
  }

  const start = match.index ?? 0;
  const end = start + match[0].length;
  const prefix = noSpaces.slice(0, start);
  const numberStr = match[0];
  const suffix = noSpaces.slice(end);

  return { prefix, numberStr, suffix };
}

function parseNumber(numberStr: string) {
  // Normalise comma to dot so "1,5" parses as 1.5 rather than 15.
  const decimalSeparator = numberStr.includes(",") ? "," : ".";
  const cleaned = numberStr.replace(",", ".");
  const value = parseFloat(cleaned);

  // Count decimal places from the normalised string
  const dotIndex = cleaned.lastIndexOf(".");
  const decimals = dotIndex >= 0 ? cleaned.length - dotIndex - 1 : 0;

  return {
    value: Number.isFinite(value) ? value : 0,
    decimals,
    decimalSeparator,
  };
}

// We format the number to have thousand spaces, preserving the author's decimal
// separator (comma for sv-SE/de-DE, dot for en-EU).
function formatWithSpaces(value: number, decimals: number, decimalSeparator = ".") {
  const [intStr, fracStr = ""] = value.toFixed(decimals).split(".");
  const intWithSpaces = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return fracStr ? `${intWithSpaces}${decimalSeparator}${fracStr}` : intWithSpaces;
}

const sizeClasses = {
  Small: "text-3xl font-semibold mb-1",
  Medium: "text-4xl lg:text-4xl 2xl:text-5xl",
  Large: "text-5xl xl:text-6xl",
};

export default function AnimatedNumber({
  field,
  valueText,
  size = "Medium",
  className,
  numberClassName,
  durationMs = 1500,
  decimals = "auto",
  ease = "easeOut",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Fires ~120px before the number scrolls in, so the reset to 0 happens off-screen.
  const isInView = useInView(ref, { once: true, amount: 0.3, margin: "0px 0px 120px 0px" });

  const text = useMemo(() => {
    if (field) return asText(field);
    return valueText ?? "";
  }, [field, valueText]);

  const { prefix, numberStr, suffix } = useMemo(() => splitTextIntoParts(text), [text]);

  const parsed = useMemo(() => parseNumber(numberStr), [numberStr]);
  const target = parsed.value;
  const resolvedDecimals = decimals === "auto" ? parsed.decimals : (decimals ?? 0);
  const separator = parsed.decimalSeparator;

  const hasNumber = numberStr !== "";

  // Seeded with the final value so the SSR/no-JS HTML never carries a fallback zero.
  const [display, setDisplay] = useState<string>(() => formatWithSpaces(target, resolvedDecimals, separator));

  // A counter already on screen at load keeps its value rather than snapping back to 0.
  const visibleAtMount = useRef(false);
  useIsomorphicLayoutEffect(() => {
    const rect = ref.current?.getBoundingClientRect();
    visibleAtMount.current = Boolean(rect && rect.top < window.innerHeight && rect.bottom > 0);
  }, []);

  useEffect(() => {
    if (!hasNumber) return;

    const finalValue = formatWithSpaces(target, resolvedDecimals, separator);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Skipping the count-up still writes the value, or a reused instance keeps
    // the old number.
    if (!isInView || visibleAtMount.current || reducedMotion) {
      setDisplay(finalValue);
      return;
    }

    const controls = animate(0 as number, target as number, {
      duration: durationMs / 1000,
      ease: ease,
      onUpdate: (latest: number) => {
        setDisplay(formatWithSpaces(latest, resolvedDecimals, separator));
      },
    });

    return () => controls.stop();
  }, [isInView, hasNumber, target, resolvedDecimals, separator, durationMs, ease]);

  const classes = cn(sizeClasses[size], className, "font-semibold tabular-nums leading-none");

  // No digits to count, so render the author string as it was written.
  if (!hasNumber) {
    return (
      <div ref={ref} className={classes}>
        {text}
      </div>
    );
  }

  return (
    <div ref={ref} className={classes}>
      {prefix && <span>{prefix} </span>}
      <span className={numberClassName}>{display}</span>
      {suffix && <span> {suffix}</span>}
    </div>
  );
}
