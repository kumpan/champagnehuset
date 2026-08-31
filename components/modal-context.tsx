"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ============================================================================
// Modal manager
// ----------------------------------------------------------------------------
// One coordinator for the three take-over surfaces so only ever ONE shows at a
// time, in a fixed priority:
//   1. age gate    — blocking; must be answered before anything else
//   2. cookie banner
//   3. newsletter  — off the landing page, after a browsing delay
//
// The newsletter remembers two things, both in localStorage: a dismissal (hidden
// for the CMS-configured number of days) and a subscription (hidden far longer,
// so a subscriber does not keep getting asked).
//
// The cookie banner keeps its original `useCookieBanner()` API (used by the
// banner itself and the footer re-open button) so nothing else has to change.
// ============================================================================

type ActiveModal = "age" | "cookie" | "newsletter" | null;

const AGE_KEY = "age-consent";
const COOKIE_KEY = "cookie-consent";
const NEWSLETTER_KEY = "newsletter-seen"; // dismissal timestamp
const SUBSCRIBED_KEY = "newsletter-subscribed"; // signup timestamp, outliving a dismissal
const TIMER_KEY = "newsletter-timer-start"; // sessionStorage, survives navigation

const DAY_MS = 86_400_000;
/** How long a signup suppresses the popup */
const SUBSCRIBED_DAYS = 30;

/** True while a stored timestamp is still inside its window. */
function isFresh(raw: string | null, days: number) {
  if (!raw) return false;
  const stamped = Number(raw);
  return Number.isFinite(stamped) && stamped > 0 && Date.now() - stamped < days * DAY_MS;
}

const hasSubscribed = () => isFresh(localStorage.getItem(SUBSCRIBED_KEY), SUBSCRIBED_DAYS);

/** Stamped by every newsletter form on success, so subscribers stop seeing the popup. */
export function markNewsletterSubscribed() {
  localStorage.setItem(SUBSCRIBED_KEY, String(Date.now()));
}

interface ModalContextType {
  /** The single modal currently allowed to be visible. */
  active: ActiveModal;
  /** True once localStorage has been read, nothing shows before this. */
  hydrated: boolean;
  // Age gate
  confirmAge: () => void;
  // Cookie banner (back-compat surface)
  isVisible: boolean;
  showCookieBanner: () => void;
  hideCookieBanner: () => void;
  toggleCookieBanner: () => void;
  // Newsletter
  dismissNewsletter: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({
  children,
  localeIds = [],
  ageGateEnabled = false,
  newsletterEnabled = false,
  newsletterAvailable = false,
  newsletterDelaySeconds = 10,
  newsletterDismissDays = 5,
}: {
  children: ReactNode;
  /** All locale ids (e.g. ["sv-se", "en-gb"]) so a bare-locale home path is detected. */
  localeIds?: string[];
  ageGateEnabled?: boolean;
  newsletterEnabled?: boolean;
  newsletterAvailable?: boolean;
  newsletterDelaySeconds?: number;
  newsletterDismissDays?: number;
}) {
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [ageDone, setAgeDone] = useState(false);
  const [cookieDone, setCookieDone] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [cookieOverride, setCookieOverride] = useState(false);
  const [newsletterReady, setNewsletterReady] = useState(false);

  // Landing page = the site home. The master locale serves clean URLs, so its
  // home is "/"; a non-master locale home is just its prefix (e.g. "/en-gb").
  // Any deeper path is not the landing page.
  const isLanding = useMemo(() => {
    const segments = (pathname ?? "/").split("/").filter(Boolean);
    if (segments.length === 0) return true;
    return segments.length === 1 && localeIds.includes(segments[0]);
  }, [pathname, localeIds]);

  // Read storage to avoid an SSR flash when age gate has no CMS content
  useEffect(() => {
    setAgeDone(ageGateEnabled ? !!localStorage.getItem(AGE_KEY) : true);
    setCookieDone(!!localStorage.getItem(COOKIE_KEY));
    setNewsletterDone(hasSubscribed() || isFresh(localStorage.getItem(NEWSLETTER_KEY), newsletterDismissDays));
    setHydrated(true);
  }, [ageGateEnabled, newsletterDismissDays]);

  // Newsletter delay and check if we're off the landing page
  useEffect(() => {
    if (!hydrated || !newsletterEnabled || newsletterDone || newsletterReady) return;
    if (!ageDone || !cookieDone || isLanding) return;

    const delayMs = Math.max(0, newsletterDelaySeconds) * 1000;
    let start = Number(sessionStorage.getItem(TIMER_KEY));
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(TIMER_KEY, String(start));
    }

    const reveal = () => {
      if (!hasSubscribed()) setNewsletterReady(true);
    };

    const remaining = start + delayMs - Date.now();
    if (remaining <= 0) {
      reveal();
      return;
    }
    const timer = setTimeout(reveal, remaining);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    newsletterEnabled,
    newsletterDone,
    newsletterReady,
    ageDone,
    cookieDone,
    isLanding,
    newsletterDelaySeconds,
  ]);

  // Manual modal triggers from the browser console.
  useEffect(() => {
    const w = window as unknown as { __modals?: Record<string, () => void> };
    w.__modals = {
      age: () => {
        if (!ageGateEnabled) return;
        setAgeDone(false);
      },
      cookie: () => {
        setAgeDone(true);
        setCookieOverride(true);
      },
      newsletter: () => {
        if (!newsletterAvailable) return;
        setAgeDone(true);
        setCookieDone(true);
        setCookieOverride(false);
        setNewsletterDone(false);
        setNewsletterReady(true);
      },
      reset: () => {
        localStorage.removeItem(AGE_KEY);
        localStorage.removeItem(COOKIE_KEY);
        localStorage.removeItem(NEWSLETTER_KEY);
        localStorage.removeItem(SUBSCRIBED_KEY);
        sessionStorage.removeItem(TIMER_KEY);
        window.location.reload();
      },
    };
    return () => {
      delete w.__modals;
    };
  }, [ageGateEnabled, newsletterAvailable]);

  // Priority resolution. Age can never be preempted.
  const active: ActiveModal = useMemo(() => {
    if (!hydrated) return null;
    if (!ageDone) return "age";
    if (cookieOverride) return "cookie";
    if (!cookieDone) return "cookie";
    if (newsletterReady && !newsletterDone) return "newsletter";
    return null;
  }, [hydrated, ageDone, cookieOverride, cookieDone, newsletterReady, newsletterDone]);

  const confirmAge = useCallback(() => {
    localStorage.setItem(AGE_KEY, new Date().toISOString());
    setAgeDone(true);
  }, []);

  const showCookieBanner = useCallback(() => setCookieOverride(true), []);
  const hideCookieBanner = useCallback(() => {
    setCookieOverride(false);
    setCookieDone(true);
  }, []);
  const toggleCookieBanner = useCallback(() => setCookieOverride((v) => !v), []);

  const dismissNewsletter = useCallback(() => {
    localStorage.setItem(NEWSLETTER_KEY, String(Date.now()));
    setNewsletterReady(false);
    setNewsletterDone(true);
  }, []);

  const value = useMemo<ModalContextType>(
    () => ({
      active,
      hydrated,
      confirmAge,
      isVisible: active === "cookie",
      showCookieBanner,
      hideCookieBanner,
      toggleCookieBanner,
      dismissNewsletter,
    }),
    [active, hydrated, confirmAge, showCookieBanner, hideCookieBanner, toggleCookieBanner, dismissNewsletter],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}

/** Back-compat hook for the cookie banner + footer re-open button. */
export function useCookieBanner() {
  const { isVisible, showCookieBanner, hideCookieBanner, toggleCookieBanner } = useModal();
  return { isVisible, showCookieBanner, hideCookieBanner, toggleCookieBanner };
}
