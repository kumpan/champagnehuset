import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { generateBreadcrumbSchema, safeJsonLd } from "@/lib/schema-utils";

interface BreadcrumbSchemaProps {
  breadcrumbs: BreadcrumbItem[];
}

/** BreadcrumbList JSON-LD. Null when the trail is too short (e.g. home page) to be useful. */
export function BreadcrumbSchema({ breadcrumbs }: BreadcrumbSchemaProps) {
  const schema = generateBreadcrumbSchema(breadcrumbs);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
