import articleModel from "@/customtypes/article/index.json";
import { t } from "./i18n";

// Canonical chip order comes from the article model so the CMS and the UI never drift
export const ARTICLE_TAGS: readonly string[] = articleModel.json.Main.tag.config.options;

/** Resolves a lowercase `?tag=` back to the stored value. Anything unknown means no filter. */
export function parseTagParam(value: string | string[] | null | undefined): string | null {
  const slug = [value].flat()[0]?.toLowerCase();
  return ARTICLE_TAGS.find((tag) => tag.toLowerCase() === slug) ?? null;
}

/**
 * Visitor-facing label for a stored tag. Keyed by the stored value, so a new
 * locale translates the tags without touching what the CMS stores.
 */
export function tagLabel(tag: string, lang: string | null | undefined): string {
  const dict = t(lang);
  const labels: Record<string, string> = {
    Event: dict.tagEvent,
    Tips: dict.tagTips,
    Nyheter: dict.tagNews,
    Kunskap: dict.tagKnowledge,
  };
  return labels[tag];
}
