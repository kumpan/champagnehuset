"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const svgCache = new Map<string, string>();

let instanceCounter = 0;

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

const colorProcessor = (code: string) => {
  let processed = code.replace(/fill=".*?"/g, 'fill="currentColor"');
  processed = processed.replace(/style="[^"]*fill:[^;"]+;?[^"]*"/g, 'style="fill:currentColor;"');
  processed = processed.replace(/<path(?![^>]*\bfill=)([^>]*)>/g, '<path$1 fill="currentColor">');
  return processed;
};

const CustomSVG = ({
  src,
  className,
  title,
  processColor = false,
}: {
  src: string;
  className?: string;
  title?: string | null;
  processColor?: boolean;
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [suffix] = useState(() => String(++instanceCounter));

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${src}:${processColor}`;
    const cached = svgCache.get(cacheKey);
    if (cached) {
      setSvgContent(uniquifyIds(cached, suffix));
      return;
    }
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return;
        const result = processColor ? colorProcessor(text) : text;
        svgCache.set(cacheKey, result);
        setSvgContent(uniquifyIds(result, suffix));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src, processColor, suffix]);

  if (!svgContent) return null;

  const ariaProps = title ? { role: "img" as const, "aria-label": title } : {};

  return (
    <span
      className={cn("inline-flex items-center [&_svg]:h-full [&_svg]:w-auto", className)}
      {...ariaProps}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional SVG inline injection
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export { CustomSVG };
