import type { Content, ImageField, RichTextField } from "@prismicio/client";
import { asImageSrc, asText, isFilled } from "@prismicio/client";
import type { BreadcrumbItem } from "./breadcrumbs";
import { formatAlcohol, formatDosage, formatGrapes } from "./format";
import { ORGANIZATION_CONFIG, SITE_URL } from "./schema-config";

/** Serialize JSON-LD, escaping `<` so it can't break out of the inline script (XSS). */
export function safeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/** Organization schema, used on every page for a consistent brand identity in search. */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION_CONFIG.name,
    alternateName: ORGANIZATION_CONFIG.alternateName,
    url: ORGANIZATION_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: ORGANIZATION_CONFIG.logo,
    },
    description: ORGANIZATION_CONFIG.description,
    foundingDate: ORGANIZATION_CONFIG.foundingDate,
    contactPoint: {
      "@type": "ContactPoint",
      ...ORGANIZATION_CONFIG.contactPoint,
    },
    address: {
      "@type": "PostalAddress",
      ...ORGANIZATION_CONFIG.address,
    },
    ...(ORGANIZATION_CONFIG.sameAs.length > 0 && {
      sameAs: ORGANIZATION_CONFIG.sameAs,
    }),
  };
}

/** FAQPage schema from FAQ slice data, for Google's FAQ rich results. */
export function generateFaqSchema(
  faqs: Array<{
    question: string | null | undefined;
    answer: RichTextField;
  }>,
) {
  const validFaqs = faqs.filter((faq) => faq.question && faq.answer && faq.answer.length > 0);

  if (validFaqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: asText(faq.answer),
      },
    })),
  };
}

/** BreadcrumbList schema. Skips trails under 2 items, since just home isn't useful. */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  if (breadcrumbs.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

/** Article schema. Headline/description from meta fields, dates from Prismic metadata. */
export function generateArticleSchema(doc: Content.ArticleDocument) {
  const headline = doc.data.meta_title || doc.data.page_title || doc.uid;
  if (!headline) return null;

  const url = doc.url ? `${SITE_URL}${doc.url}` : undefined;
  const imageUrl = asImageSrc(doc.data.meta_image as ImageField);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    ...(doc.data.meta_description && {
      description: doc.data.meta_description,
    }),
    ...(imageUrl && { image: imageUrl }),
    ...(url && { mainEntityOfPage: { "@type": "WebPage", "@id": url } }),
    datePublished: doc.first_publication_date,
    dateModified: doc.last_publication_date,
    inLanguage: doc.lang,
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(doc.data.tag && { articleSection: doc.data.tag }),
  };
}

/** Product schema. Brand is the linked producer; no price/offer is emitted. */
export function generateProductSchema(doc: Content.ProductDocument) {
  const data = doc.data;
  const name = data.product_name || data.meta_title || doc.uid;
  if (!name) return null;

  const url = doc.url ? `${SITE_URL}${doc.url}` : undefined;
  const imageUrl = asImageSrc(data.product_image as ImageField) || asImageSrc(data.meta_image as ImageField);
  const description = isFilled.richText(data.product_description)
    ? asText(data.product_description)
    : data.meta_description || undefined;
  const producerName = isFilled.contentRelationship(data.product_producer)
    ? data.product_producer.data?.producer_name
    : undefined;

  const grapes = formatGrapes(data.product_grapes);
  const origin = [data.product_region, data.product_cru].filter(Boolean).join(", ");
  const dosage = formatDosage(data.product_dosage_grams);
  const alcohol = formatAlcohol(data.product_alcohol);
  const additionalProperty = [
    grapes && { "@type": "PropertyValue", name: "Druvor", value: grapes },
    data.product_volume && { "@type": "PropertyValue", name: "Volym", value: data.product_volume },
    origin && { "@type": "PropertyValue", name: "Ursprung", value: origin },
    dosage && { "@type": "PropertyValue", name: "Dosage", value: dosage },
    alcohol && { "@type": "PropertyValue", name: "Alkohol", value: alcohol },
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    ...(url && { url }),
    ...(producerName && { brand: { "@type": "Brand", name: producerName } }),
    ...(data.product_article_number && { sku: data.product_article_number }),
    ...(data.product_style && { category: data.product_style }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
  };
}
