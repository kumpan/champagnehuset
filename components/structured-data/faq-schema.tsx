import type { Content } from "@prismicio/client";
import { generateFaqSchema, safeJsonLd } from "@/lib/schema-utils";

interface FaqSchemaProps {
  slices: Content.PageDocumentData["slices"] | Content.ArticleDocumentData["slices"];
}

/**
 * Extracts FAQ data from FaqList slices and renders a FAQPage JSON-LD script.
 * Improves chances of FAQ rich results in Google search.
 */
export function FaqSchema({ slices }: FaqSchemaProps) {
  const allFaqs = Array.from(slices)
    .filter((slice) => slice.slice_type === "faq")
    .flatMap((slice) => {
      const faqSlice = slice as Content.FaqSlice;
      return faqSlice.primary.faqlist.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));
    });

  if (allFaqs.length === 0) return null;

  const schema = generateFaqSchema(allFaqs);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
