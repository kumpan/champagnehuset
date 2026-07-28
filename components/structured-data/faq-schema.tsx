import type { Content } from "@prismicio/client";
import { generateFaqSchema, safeJsonLd } from "@/lib/schema-utils";

interface FaqSchemaProps {
  slices:
    | Content.PageDocumentData["slices"]
    | Content.ArticleDocumentData["slices"]
    | Content.ProductDocumentData["slices"]
    | Content.ProducerDocumentData["slices"];
}

/** Pulls FAQs from FaqList slices into a FAQPage JSON-LD script, for Google FAQ rich results. */
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
