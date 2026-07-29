"use client";

import { useEffect } from "react";
import { setAvailableLocales } from "@/lib/available-locales";

/**
 * Invisible client component that registers which locales have a translation of
 * the current page, so the LanguageSwitcher has up-to-date data after hydration.
 */
export function AvailableLocalesSetter({ locales }: { locales: string[] }) {
  useEffect(() => {
    setAvailableLocales(locales);
  }, [locales]);
  return null;
}
