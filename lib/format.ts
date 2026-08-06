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

/**
 * Join a product's grapes into "Pinot Noir, Chardonnay" (null when empty).
 *
 * `product_grapes` became a repeatable group, but documents published before
 * the schema change still return the old free-text string. Accept either shape
 * so the field renders through the migration window instead of crashing.
 */
export function formatGrapes(
  grapes: Content.ProductDocument["data"]["product_grapes"] | string | null | undefined,
): string | null {
  if (!grapes) return null;
  if (typeof grapes === "string") return grapes.trim() || null;
  const names = grapes.flatMap((entry) => (entry.grape ? [entry.grape] : []));
  return names.length > 0 ? names.join(", ") : null;
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
