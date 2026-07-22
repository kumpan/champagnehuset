"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/button";
import { useCookieBanner } from "@/components/cookie-banner-context";

export function FooterCookieButton({ label }: { label: string }) {
  const { showCookieBanner } = useCookieBanner();

  return (
    <Button type="button" sectionTheme="Brand" onClick={showCookieBanner}>
      <span>{label}</span>
      <Settings aria-hidden="true" />
    </Button>
  );
}
