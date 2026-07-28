"use client";

import { ChevronUp, Settings } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { useCookieBanner } from "@/components/cookie-banner-context";
import { CustomRichText } from "@/components/custom-rich-text";
import { Switch } from "@/components/switch";
import type { CookieBannerDocument, CookieBannerDocumentDataCookieTypesItem } from "@/prismicio-types";

// Window extensions for gtag / GTM.
declare global {
  interface Window {
    gtag: (command: "consent" | "config" | "js", action: string, parameters?: Record<string, string | boolean>) => void;
    dataLayer: Record<string, unknown>[];
  }
}

interface CookiePreferences {
  necessary: boolean;
  analytics_storage: boolean;
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  functionality_storage: boolean;
  security_storage: boolean;
  personalization_storage: boolean;
}

export function CookieBanner({ prismicData }: { prismicData: CookieBannerDocument }) {
  const { isVisible, hideCookieBanner } = useCookieBanner();
  const [showCustomize, setShowCustomize] = useState(false);
  const [expandedCookies, setExpandedCookies] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics_storage: false,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
    functionality_storage: false,
    security_storage: false,
    personalization_storage: false,
  });

  // Expand / collapse cookie details
  const toggleCookieExpansion = (cookieId: string) => {
    setExpandedCookies((prev) => {
      const next = new Set(prev);
      if (next.has(cookieId)) {
        next.delete(cookieId);
      } else {
        next.add(cookieId);
      }
      return next;
    });
  };

  // Sync consent to Google Tag Manager
  const updateGtagConsent = useCallback((prefs: CookiePreferences) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: prefs.analytics_storage ? "granted" : "denied",
        ad_storage: prefs.ad_storage ? "granted" : "denied",
        ad_user_data: prefs.ad_user_data ? "granted" : "denied",
        ad_personalization: prefs.ad_personalization ? "granted" : "denied",
        functionality_storage: prefs.functionality_storage ? "granted" : "denied",
        security_storage: prefs.security_storage ? "granted" : "denied",
        personalization_storage: prefs.personalization_storage ? "granted" : "denied",
      });
      // Push a consent event to dataLayer for GTM triggers
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "cookie_consent_update",
        consent_analytics: prefs.analytics_storage,
        consent_advertising: prefs.ad_storage,
        consent_ad_user_data: prefs.ad_user_data,
        consent_ad_personalization: prefs.ad_personalization,
        consent_functionality: prefs.functionality_storage,
        consent_security: prefs.security_storage,
        consent_personalization: prefs.personalization_storage,
        consent_necessary: prefs.necessary,
      });
    } else {
      console.warn("gtag not available, consent not updated");
    }
  }, []);

  // Restore saved consent on mount
  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (cookieConsent) {
      const existingPrefs = JSON.parse(cookieConsent) as CookiePreferences;
      updateGtagConsent(existingPrefs);
      setPreferences(existingPrefs);
    }
  }, [updateGtagConsent]);

  // Consent action handlers
  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics_storage: true,
      ad_storage: true,
      ad_user_data: true,
      ad_personalization: true,
      functionality_storage: true,
      security_storage: true,
      personalization_storage: true,
    };
    saveCookiePreferences(allPreferences);
    hideCookieBanner();
  };

  const handleAcceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics_storage: false,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      functionality_storage: false,
      security_storage: false,
      personalization_storage: false,
    };
    saveCookiePreferences(necessaryOnly);
    hideCookieBanner();
  };

  const handleCustomizePreferences = () => {
    setShowCustomize(true);
  };

  const handleSaveCustomPreferences = () => {
    saveCookiePreferences(preferences);
    hideCookieBanner();
  };

  // Persist preferences (localStorage + gtag)
  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    updateGtagConsent(prefs);
  };

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: "5rem", scale: 0.8 },
    visible: {
      opacity: 1,
      y: "0rem",
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: "10rem",
      scale: 0.3,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={isVisible}>
      {isVisible && (
        <m.div
          variants={variants}
          initial="hidden"
          key="cookie-banner"
          animate="visible"
          exit="exit"
          transition={{
            opacity: { duration: 0.4, ease: "easeInOut" },
            y: { type: "spring", stiffness: 250, damping: 20 },
            scale: { type: "spring", stiffness: 250, damping: 20 },
          }}
          className="pointer-events-none fixed bottom-0 left-0 z-50 w-full origin-bottom p-2 selection:bg-brand selection:text-brand-ink md:origin-bottom-left md:px-6 md:pb-6"
        >
          <div className="mx-auto max-w-12xl">
            <div className="pointer-events-auto relative w-full max-w-2xl rounded-2 bg-fill shadow-float">
              <div className="container max-w-2xl p-4 md:p-8">
                {!showCustomize ? (
                  /* Main banner */
                  <div className="flex flex-col gap-4 md:justify-between">
                    <div className="flex flex-1 flex-col items-start gap-1">
                      {prismicData.data.title && (
                        <CustomRichText
                          field={prismicData.data.title}
                          className="text-2xl leading-tight md:text-3xl"
                          inheritSize={true}
                        />
                      )}
                      {prismicData.data.description && (
                        <CustomRichText
                          field={prismicData.data.description}
                          className="mb-4 text-ink text-sm md:text-base"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row">
                      <Button variant="outline" onClick={handleCustomizePreferences} className="order-3 md:order-1">
                        <Settings className="size-4" />
                        {prismicData.data.customize_label || "Customize preferences"}
                      </Button>
                      <Button onClick={handleAcceptNecessaryOnly} className="order-2 md:ml-auto">
                        {prismicData.data.accept_necessary_label || "Accept necessary"}
                      </Button>
                      <Button onClick={handleAcceptAll} className="order-1 md:order-3">
                        {prismicData.data.accept_all_label || "Accept all cookies"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Customize view */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="mt-0.5 text-lg">
                          {prismicData.data.customize_label || "Customize Cookie Preferences"}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {prismicData.data.cookie_types?.map(
                        (cookieType: CookieBannerDocumentDataCookieTypesItem, index: number) => {
                          const title = cookieType.title || "";
                          const cookieIds = (cookieType.cookie_id || "")
                            .split(",")
                            .map((id: string) => id.trim())
                            .filter(Boolean);

                          // All preference keys this cookie type maps to
                          const getPreferenceKeys = (ids: string[]): (keyof CookiePreferences)[] => {
                            const keys: (keyof CookiePreferences)[] = [];
                            ids.forEach((id) => {
                              switch (id) {
                                case "necessary":
                                  keys.push("necessary");
                                  break;
                                case "analytics_storage":
                                  keys.push("analytics_storage");
                                  break;
                                case "ad_storage":
                                  keys.push("ad_storage");
                                  break;
                                case "ad_user_data":
                                  keys.push("ad_user_data");
                                  break;
                                case "ad_personalization":
                                  keys.push("ad_personalization");
                                  break;
                                case "functionality_storage":
                                  keys.push("functionality_storage");
                                  break;
                                case "security_storage":
                                  keys.push("security_storage");
                                  break;
                                case "personalization_storage":
                                  keys.push("personalization_storage");
                                  break;
                                default:
                                  console.warn(
                                    `Unknown cookie ID: ${id}. Valid IDs are: necessary, analytics_storage, ad_storage, ad_user_data, ad_personalization, functionality_storage, security_storage, personalization_storage`,
                                  );
                                  break;
                              }
                            });
                            return keys;
                          };

                          const preferenceKeys = getPreferenceKeys(cookieIds);
                          if (preferenceKeys.length === 0) return null;

                          // Switch is on only when every mapped key is enabled
                          const allEnabled = preferenceKeys.every((key) => preferences[key]);
                          const isDisabled = cookieType.checked_and_disabled;
                          const cookieId = cookieType.cookie_id || `cookie-type-${index}`;
                          const isExpanded = expandedCookies.has(cookieId);

                          return (
                            <div key={cookieId} className="border-fill-raised not-last:border-b">
                              <div className="flex items-center justify-between gap-4">
                                <button
                                  type="button"
                                  onClick={() => toggleCookieExpansion(cookieId)}
                                  className="flex flex-1 cursor-pointer items-center gap-1.5 py-4 text-left"
                                  aria-expanded={isExpanded}
                                >
                                  <m.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 250,
                                      damping: 20,
                                    }}
                                  >
                                    <ChevronUp className="size-5.5" />
                                  </m.div>
                                  <h5 className="font-medium text-lg">{title}</h5>
                                </button>
                                <Switch
                                  checked={isDisabled ? true : allEnabled}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked: boolean) => {
                                    setPreferences((prev) => {
                                      const updated = { ...prev };
                                      preferenceKeys.forEach((key) => {
                                        updated[key] = checked;
                                      });
                                      return updated;
                                    });
                                  }}
                                  aria-label={`${title} cookies`}
                                />
                              </div>
                              <AnimatePresence initial={false}>
                                {isExpanded && cookieType.description && (
                                  <m.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.35,
                                      ease: "easeInOut",
                                    }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pb-4">
                                      <CustomRichText field={cookieType.description} className="text-ink-dim" />
                                    </div>
                                  </m.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        },
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 md:flex-row md:justify-end">
                      <Button variant="outline" onClick={() => setShowCustomize(false)} className="order-2 md:order-1">
                        {prismicData.data.cancel_label || "Cancel"}
                      </Button>
                      <Button onClick={handleSaveCustomPreferences} className="order-1 md:order-2">
                        {prismicData.data.save_preferences_label || "Save preferences"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
