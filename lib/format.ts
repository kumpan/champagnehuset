/**
 * CMS values for price, dosage and alcohol are free-text so editors can type
 * "350", "350 kr", "6 g/l", "12%" and so on. We strip whatever unit they typed
 * and re-format consistently. A non-breaking space keeps the number and unit
 * (and thousands groups) from wrapping.
 */
const NBSP = " ";

/** Pull the first numeric token (digits with an optional , or . decimal). */
function extractNumber(input: string): string | null {
  const match = input.replace(/\s+/g, "").match(/-?\d+(?:[.,]\d+)?/);
  return match ? match[0] : null;
}

/** "350kr" | "1200" | "1 200 kr" → "1 200 kr" (thousands grouped, decimals dropped). */
export function formatPrice(input: string | null | undefined): string | null {
  if (!input) return null;
  const num = extractNumber(input);
  if (num === null) return null;

  const intPart = num.replace(/[.,]\d+$/, "").replace(/\D/g, "");
  if (!intPart) return null;

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${grouped}${NBSP}kr`;
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
