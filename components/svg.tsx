import { cn } from "@/lib/utils";

/** Deterministic short hash of the src, so each asset gets a stable id suffix (server === client). */
function hashSrc(src: string): string {
  let hash = 5381;
  for (let i = 0; i < src.length; i++) hash = (hash * 33) ^ src.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

/** Rewrite explicit fills to `currentColor` so the SVG inherits its text color. */
function colorProcessor(code: string): string {
  let processed = code.replace(/fill=".*?"/g, 'fill="currentColor"');
  processed = processed.replace(/style="[^"]*fill:[^;"]+;?[^"]*"/g, 'style="fill:currentColor;"');
  processed = processed.replace(/<path(?![^>]*\bfill=)([^>]*)>/g, '<path$1 fill="currentColor">');
  return processed;
}

/** Suffix internal ids so multiple inlined copies of one SVG don't collide (gradients, masks…). */
function uniquifyIds(svg: string, suffix: string): string {
  const ids: string[] = [];
  svg.replace(/\bid="([^"]+)"/g, (_, id) => {
    ids.push(id);
    return _;
  });
  let result = svg;
  for (const id of ids) {
    result = result.replaceAll(`id="${id}"`, `id="${id}-${suffix}"`);
    result = result.replaceAll(`#${id}`, `#${id}-${suffix}`);
    result = result.replaceAll(`url(#${id})`, `url(#${id}-${suffix})`);
  }
  return result;
}

/**
 * Fetches an SVG on the server and inlines it into the HTML — optionally rewriting fills to
 * `currentColor` (via `processColor`) so it inherits the surrounding text color. Because it
 * renders server-side, the markup ships in the initial HTML: no client fetch, no round trip,
 * no pop-in.
 *
 * It's an async Server Component, so use it in one of two ways:
 * - From a Server Component, render it directly (e.g. the footer logo).
 * - For a Client Component, render it in a server file and pass it down as a prop/child
 *   (e.g. the layout builds the navbar logo and passes it to <Navbar>).
 */
export async function CustomSVG({
  src,
  className,
  title,
  processColor = false,
}: {
  src: string;
  className?: string;
  title?: string | null;
  processColor?: boolean;
}) {
  let svg: string;
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const text = await res.text();
    svg = uniquifyIds(processColor ? colorProcessor(text) : text, hashSrc(src));
  } catch {
    return null;
  }

  const ariaProps = title ? { role: "img" as const, "aria-label": title } : {};

  return (
    <span
      className={cn("inline-flex items-center [&_svg]:h-full [&_svg]:w-auto", className)}
      {...ariaProps}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional SVG inline injection
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
