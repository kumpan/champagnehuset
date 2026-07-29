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
// The cookie banner keeps its original `useCookieBanner()` API (used by the
// banner itself and the footer re-open button) so nothing else has to change.
// ============================================================================

type ActiveModal = "age" | "cookie" | "newsletter" | null;

const AGE_KEY = "age-consent";
const COOKIE_KEY = "cookie-consent";
const NEWSLETTER_KEY = "newsletter-seen";
const TIMER_KEY = "newsletter-timer-start"; // sessionStorage — survives navigation

interface ModalContextType {
  /** The single modal currently allowed to be visible. */
  active: ActiveModal;
  /** True once localStorage has been read (client only) — nothing shows before this. */
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
  /** Persist "seen" without closing (so the success state can stay on screen). */
  markNewsletterSeen: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({
  children,
  localeIds = [],
  ageGateEnabled = false,
  newsletterEnabled = false,
  newsletterDelaySeconds = 45,
}: {
  children: ReactNode;
  /** All locale ids (e.g. ["sv-se", "en-gb"]) so a bare-locale home path is detected. */
  localeIds?: string[];
  ageGateEnabled?: boolean;
  newsletterEnabled?: boolean;
  newsletterDelaySeconds?: number;
}) {
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  const [ageDone, setAgeDone] = useState(false);
  const [cookieDone, setCookieDone] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [cookieOverride, setCookieOverride] = useState(false); // footer re-open
  const [newsletterReady, setNewsletterReady] = useState(false); // delay elapsed

  // Landing page = the site home. The master locale serves clean URLs, so its
  // home is "/"; a non-master locale home is just its prefix (e.g. "/en-gb").
  // Any deeper path is not the landing page.
  const isLanding = useMemo(() => {
    const segments = (pathname ?? "/").split("/").filter(Boolean);
    if (segments.length === 0) return true;
    return segments.length === 1 && localeIds.includes(segments[0]);
  }, [pathname, localeIds]);

  // Read prior choices from storage (client only) to avoid an SSR flash. When the
  // age gate has no CMS content it's treated as already resolved so it can't stall
  // the rest of the chain.
  useEffect(() => {
    setAgeDone(ageGateEnabled ? !!localStorage.getItem(AGE_KEY) : true);
    setCookieDone(!!localStorage.getItem(COOKIE_KEY));
    setNewsletterDone(!!localStorage.getItem(NEWSLETTER_KEY));
    setHydrated(true);
  }, [ageGateEnabled]);

  // Newsletter delay: start counting once age + cookie are resolved, we're off
  // the landing page, it's enabled and not yet seen. The start time is persisted
  // so the countdown accumulates across page navigations rather than resetting.
  useEffect(() => {
    if (!hydrated || !newsletterEnabled || newsletterDone || newsletterReady) return;
    if (!ageDone || !cookieDone || isLanding) return;

    const delayMs = Math.max(0, newsletterDelaySeconds) * 1000;
    let start = Number(sessionStorage.getItem(TIMER_KEY));
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(TIMER_KEY, String(start));
    }

    const remaining = start + delayMs - Date.now();
    if (remaining <= 0) {
      setNewsletterReady(true);
      return;
    }
    const timer = setTimeout(() => setNewsletterReady(true), remaining);
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

  // Dev-only: manual modal triggers from the browser console. Compiled out in
  // production. Usage: __modals.age() · __modals.cookie() · __modals.newsletter()
  // · __modals.reset() (clears storage + reloads). Age/newsletter also need their
  // Prismic singleton published, or the modal component isn't mounted to show.
  useEffect(() => {
    // if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __modals?: Record<string, () => void> };
    w.__modals = {
      age: () => setAgeDone(false),
      cookie: () => {
        setAgeDone(true);
        setCookieOverride(true);
      },
      newsletter: () => {
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
        sessionStorage.removeItem(TIMER_KEY);
        window.location.reload();
      },
    };
    return () => {
      delete w.__modals;
    };
  }, []);

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
    // The banner's accept handlers write cookie-consent before calling this.
    setCookieOverride(false);
    setCookieDone(true);
  }, []);
  const toggleCookieBanner = useCallback(() => setCookieOverride((v) => !v), []);

  const dismissNewsletter = useCallback(() => {
    localStorage.setItem(NEWSLETTER_KEY, new Date().toISOString());
    setNewsletterReady(false);
    setNewsletterDone(true);
  }, []);

  const markNewsletterSeen = useCallback(() => {
    localStorage.setItem(NEWSLETTER_KEY, new Date().toISOString());
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
      markNewsletterSeen,
    }),
    [
      active,
      hydrated,
      confirmAge,
      showCookieBanner,
      hideCookieBanner,
      toggleCookieBanner,
      dismissNewsletter,
      markNewsletterSeen,
    ],
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
