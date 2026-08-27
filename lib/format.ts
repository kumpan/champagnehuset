import type { Content } from "@prismicio/client";

/**
 * CMS values for dosage and alcohol are free-text so editors can type
 * "6 g/l", "12%" and so on. We strip whatever unit they typed and re-format
 * consistently. A non-breaking space keeps the number and unit from wrapping.
 */
const NBSP = " ";

/** Pull the first numeric token (digits with an optional , or . decimal). */
function extractNumber(input: string): string | null {
  const match = input.replace(/\s+/g, "").match(/-?\d+(?:[.,]\d+)?/);
  return match ? match[0] : null;
}

/** Documents from before the select was renamed still store "Meunier". */
export function normalizeGrape(grape: string): string {
  return grape === "Meunier" ? "Pinot Meunier" : grape;
}

/** Join a product's grapes into "Pinot Noir, Chardonnay" (null when empty). */
export function formatGrapes(grapes: Content.ProductDocument["data"]["product_grapes"]): string | null {
  const names = grapes.flatMap((entry) => (entry.grape ? [normalizeGrape(entry.grape)] : []));
  return names.length > 0 ? names.join(", ") : null;
}

/**
 * Like `formatGrapes`, but with each grape's share when the editor filled one:
 * "Pinot Noir (60 %), Chardonnay (40 %)". Shares are free-text ("25", "25%",
 * "25,5 %"), so they're re-formatted with Swedish spacing; a share with no
 * digits renders the grape name alone.
 */
export function formatGrapesWithShares(grapes: Content.ProductDocument["data"]["product_grapes"]): string | null {
  const parts = grapes.flatMap((entry) => {
    if (!entry.grape) return [];
    const name = normalizeGrape(entry.grape);
    const share = entry.percentage ? extractNumber(entry.percentage) : null;
    return [share !== null ? `${name} (${share}${NBSP}%)` : name];
  });
  return parts.length > 0 ? parts.join(", ") : null;
}

/** All volumes a product comes in — the repeating group, else the legacy single select. */
export function productVolumes(data: Content.ProductDocument["data"]): string[] {
  const volumes = (data.product_volumes ?? []).flatMap((entry) => (entry.volume ? [entry.volume] : []));
  if (volumes.length > 0) return volumes;
  return data.product_volume ? [data.product_volume] : [];
}

/** "6" | "6 g/l" | "6g/l" → "6 g/l". Preserves decimals ("4,5" → "4,5 g/l"). */
export function formatDosage(input: string | null | undefined): string | null {
  if (!input) return null;
  const num = extractNumber(input);
  if (num === null) return null;
  return `${num}${NBSP}g/l`;
}

/** "12" | "12%" | "12,5 %" → "12%" (no space before the percent sign). */
export function formatAlcohol(input: string | null | undefined): string | null {
  if (!input) return null;
  const num = extractNumber(input);
  if (num === null) return null;
  return `${num}%`;
}
