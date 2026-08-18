import { t } from "@/lib/i18n";

// Shared between the client grid article-grid.tsx and the server list article-list.tsx
export const PAGE_SIZE = 4;

/**
 * Article tag values are stored in English in the CMS (Event / News / Tips) per
 * the "CMS values are English, UI is site language" convention. The visitor-
 * facing label comes from the dictionary, so a new locale translates the tags
 * without touching the stored values (which article-list.tsx compares on).
 */
export function tagLabel(tag: string, lang: string | null | undefined): string {
  const labels: Record<string, string> = { Event: t(lang).tagEvent, News: t(lang).tagNews, Tips: t(lang).tagTips };
  return labels[tag] ?? tag;
}
