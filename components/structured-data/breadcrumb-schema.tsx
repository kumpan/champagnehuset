import type { BreadcrumbItem } from "@/lib/breadcrumbs";
import { generateBreadcrumbSchema, safeJsonLd } from "@/lib/schema-utils";

interface BreadcrumbSchemaProps {
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Renders BreadcrumbList JSON-LD. Returns null when the trail is too short
 * (e.g. on the home page) to avoid emitting useless schema.
 */
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
