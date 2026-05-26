"use client";

import { useEffect } from "react";
import { setAvailableLocales } from "@/lib/available-locales";

/**
 * Invisible client component that registers which locales have a translation
 * of the current page. Rendered by each page server component; runs after
 * hydration so the LanguageSwitcher always has up-to-date data before any
 * user interaction.
 */
export function AvailableLocalesSetter({ locales }: { locales: string[] }) {
  useEffect(() => {
    setAvailableLocales(locales);
  }, [locales]);
  return null;
}
