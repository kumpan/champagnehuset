/** Advance widths in em for ThePortray. Regenerate these if the display font changes. */
// biome-ignore format: a glyph table reads better packed than one character per line
const ADVANCE: Record<string, number> = {
  A: 0.568, B: 0.521, C: 0.623, D: 0.63, E: 0.536, F: 0.506, G: 0.703, H: 0.63, I: 0.28,
  J: 0.334, K: 0.565, L: 0.526, M: 0.83, N: 0.588, O: 0.68, P: 0.471, Q: 0.7, R: 0.525,
  S: 0.487, T: 0.552, U: 0.608, V: 0.568, W: 0.798, X: 0.585, Y: 0.585, Z: 0.466,
  Å: 0.568, Ä: 0.568, Ö: 0.68, É: 0.536, È: 0.536, Ê: 0.536, À: 0.568, Â: 0.568, Ô: 0.68,
  Ü: 0.608, Ç: 0.623,
  "0": 0.592, "1": 0.28, "2": 0.476, "3": 0.5, "4": 0.545, "5": 0.522, "6": 0.532,
  "7": 0.516, "8": 0.49, "9": 0.532,
  "-": 0.31, "'": 0.16, "’": 0.16, ".": 0.16, ",": 0.16, "&": 0.752, "/": 0.317,
};

// Wide guess for anything unmeasured, so a stray glyph shrinks the title instead of overflowing
const UNKNOWN = 0.7;

// tracking-tight pulls every character in by this much
const TRACKING = -0.025;

/**
 * Width in em of the widest word in an uppercased display title. A column width
 * divided by this is the font size at which that word just fits.
 */
export function widestWordEm(title: string): number {
  const widths = title
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word].reduce((sum, char) => sum + (ADVANCE[char] ?? UNKNOWN) + TRACKING, 0));

  return Math.max(...widths, 1);
}
