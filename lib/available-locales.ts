/**
 * Client-side module store for the current page's available locale variants.
 * Populated by AvailableLocalesSetter on each page mount (useEffect, never runs on server).
 * Read synchronously by LanguageSwitcher when the user switches language.
 *
 * null = not yet initialised → optimistically assume all locales are available
 */
let _locales: Set<string> | null = null;

export function setAvailableLocales(locales: string[]) {
  _locales = new Set(locales);
}

export function isLocaleAvailable(lang: string): boolean {
  if (_locales === null) return true;
  return _locales.has(lang);
}
