import type { Content } from "@prismicio/client";
import { generateProductSchema, safeJsonLd } from "@/lib/schema-utils";

interface ProductSchemaProps {
  doc: Content.ProductDocument;
}

/** Product JSON-LD (with an Offer) for product documents. */
export function ProductSchema({ doc }: ProductSchemaProps) {
  const schema = generateProductSchema(doc);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
