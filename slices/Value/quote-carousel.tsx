"use client";

import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { ChevronLeft, ChevronRight, QuoteIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { EmployeeDocument } from "@/prismicio-types";

export type ResolvedQuote = {
  text: string | null | undefined;
  employee: EmployeeDocument | null;
};

const buttonThemeClasses = {
  Ocean: "bg-fill-dark text-ink-flip outline-fill-dark/0 outline-1 hover:outline-3 hover:outline-fill-dark/20",
  Sunrise:
    "bg-accent-fill-dark text-accent-ink-flip outline-accent-fill-dark/0 outline-1 hover:outline-3 hover:outline-accent-fill-dark/20",
};

const quoteMarkThemeClasses = {
  Ocean: "text-brand",
  Sunrise: "text-accent",
};

const dividerThemeClasses = {
  Ocean: "bg-brand",
  Sunrise: "bg-accent",
};

const descriptionThemeClasses = {
  Ocean: "text-ink-dim",
  Sunrise: "text-accent-ink-dim",
};

export function QuoteCarousel({
  quotes,
  sectionTheme,
}: {
  quotes: ResolvedQuote[];
  sectionTheme: "Ocean" | "Sunrise";
}) {
  const quoteCount = quotes.length;
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + quoteCount) % quoteCount);
  const next = () => setCurrent((c) => (c + 1) % quoteCount);

  const { text, employee } = quotes[current] ?? {};

  return (
    <div className="flex w-full flex-row gap-4 lg:gap-8">
      <div className={cn("w-1 shrink-0 self-stretch rounded-full", dividerThemeClasses[sectionTheme])} />

      <div className="flex w-full flex-col gap-5 lg:gap-6">
        <QuoteIcon className={cn("icon-bold size-10 md:size-12", quoteMarkThemeClasses[sectionTheme])} />

        <p className="text-balance text-xl leading-snug md:text-2xl lg:text-3xl">{text}</p>

        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {employee && (
            <div className="flex items-center gap-3">
              {isFilled.image(employee.data.employee_image) && (
                <PrismicNextImage
                  field={employee.data.employee_image}
                  className="size-16 shrink-0 rounded-4 object-cover"
                  fallbackAlt=""
                />
              )}
              <div>
                {employee.data.employee_name && <p className="font-semibold">{employee.data.employee_name}</p>}
                {employee.data.employee_title && (
                  <p className={cn("text-sm", descriptionThemeClasses[sectionTheme])}>{employee.data.employee_title}</p>
                )}
              </div>
            </div>
          )}

          {quoteCount > 1 && (
            <div className="flex w-full shrink-0 items-center gap-1 md:w-auto">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous quote"
                className={cn(
                  "group flex h-12 flex-1 cursor-pointer items-center justify-center rounded-3 transition-all duration-200 ease-in-out hover:outline-3 focus-visible:outline-3 md:size-12 md:flex-none",
                  buttonThemeClasses[sectionTheme],
                )}
              >
                <ChevronLeft className="size-5 group-hover:animate-wiggle-grow" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next quote"
                className={cn(
                  "group flex h-12 flex-1 cursor-pointer items-center justify-center rounded-3 transition-all duration-200 ease-in-out hover:outline-3 focus-visible:outline-3 md:size-12 md:flex-none",
                  buttonThemeClasses[sectionTheme],
                )}
              >
                <ChevronRight className="size-5 group-hover:animate-wiggle-grow" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
