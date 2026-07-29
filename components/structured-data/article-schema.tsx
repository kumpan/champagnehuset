import type { Content } from "@prismicio/client";
import { generateArticleSchema, safeJsonLd } from "@/lib/schema-utils";

interface ArticleSchemaProps {
  doc: Content.ArticleDocument;
}

/** Article JSON-LD for article/blog documents. */
export function ArticleSchema({ doc }: ArticleSchemaProps) {
  const schema = generateArticleSchema(doc);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
