"use client";

import { asText, type RichTextField } from "@prismicio/client";
import { animate, type Easing, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

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
  // Next we remove commas, keep dots for decimals
  const cleaned = numberStr.replace(/,/g, "");
  const value = parseFloat(cleaned);

  // Finally we count decimal places from original string
  const dotIndex = cleaned.lastIndexOf(".");
  const decimals = dotIndex >= 0 ? cleaned.length - dotIndex - 1 : 0;

  return {
    value: Number.isFinite(value) ? value : 0,
    decimals,
  };
}

// We format the number to have thousand spaces
function formatWithSpaces(value: number, decimals: number) {
  const [intStr, fracStr = ""] = value.toFixed(decimals).split(".");
  const intWithSpaces = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return fracStr ? `${intWithSpaces}.${fracStr}` : intWithSpaces;
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
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const text = useMemo(() => {
    if (field) return asText(field);
    return valueText ?? "";
  }, [field, valueText]);

  const { prefix, numberStr, suffix } = useMemo(() => splitTextIntoParts(text), [text]);

  const parsed = useMemo(() => parseNumber(numberStr), [numberStr]);
  const target = parsed.value;
  const resolvedDecimals = decimals === "auto" ? parsed.decimals : (decimals ?? 0);

  const [display, setDisplay] = useState<string>(formatWithSpaces(0, resolvedDecimals));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0 as number, target as number, {
      duration: durationMs / 1000,
      ease: ease,
      onUpdate: (latest: number) => {
        setDisplay(formatWithSpaces(latest, resolvedDecimals));
      },
    });

    return () => controls.stop();
  }, [isInView, target, resolvedDecimals, durationMs, ease]);

  return (
    <div ref={ref} className={cn(sizeClasses[size], className, "font-semibold tabular-nums leading-none")}>
      {prefix && <span>{prefix} </span>}
      <motion.span className={cn(numberClassName, "")}>{display}</motion.span>
      {suffix && <span> {suffix}</span>}
    </div>
  );
}
