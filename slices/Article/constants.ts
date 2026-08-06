// Shared between the client grid article-grid.tsx and the server list article-list.tsx
export const PAGE_SIZE = 4;

/**
 * Article tag values are stored in English in the CMS (Event / News / Tips) per the
 * "CMS values are English, UI is Swedish" convention; visitors see these Swedish
 * labels. Event and Tips read the same in Swedish, so only News → Nyheter differs.
 */
const TAG_LABELS: Record<string, string> = {
  Event: "Event",
  News: "Nyheter",
  Tips: "Tips",
};

/** Visitor-facing Swedish label for a stored tag value (falls back to the raw value). */
export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag;
}
