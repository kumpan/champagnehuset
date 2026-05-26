import { generateOrganizationSchema, safeJsonLd } from "@/lib/schema-utils";

/**
 * Organization JSON-LD component
 * Include on every page for consistent brand identity in search results
 */
export function OrganizationSchema() {
  const schema = generateOrganizationSchema();

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Official Next.js pattern for JSON-LD
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
