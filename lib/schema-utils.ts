import type { Content, ImageField, RichTextField } from "@prismicio/client";
import { asImageSrc, asText, isFilled } from "@prismicio/client";
import type { BreadcrumbItem } from "./breadcrumbs";
import { formatAlcohol, formatDosage } from "./format";
import { ORGANIZATION_CONFIG, SITE_URL } from "./schema-config";

/**
 * Safely serialize JSON-LD to prevent XSS attacks.
 * Replaces < with unicode escape sequence.
 */
export function safeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/**
 * Generate Organization schema.
 * Use on every page for consistent brand identity in search results.
 */
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

/**
 * Generate FAQPage schema from FAQ slice data.
 * Improves chances of showing in Google's FAQ rich results.
 */
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

/**
 * Generate BreadcrumbList schema from a breadcrumb trail.
 * Skips trails with fewer than 2 items (just home — not useful as a breadcrumb).
 */
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

/**
 * Generate Article schema for article/blog documents.
 * Pulls headline/description from meta fields, dates from Prismic publication metadata.
 */
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
    ...(doc.data.category && { articleSection: doc.data.category }),
  };
}

/** "995" | "1 200 kr" → "1200" (integer string) for a schema.org Offer.price. */
function parsePrice(input: string | null | undefined): string | null {
  if (!input) return null;
  const match = input.replace(/\s+/g, "").match(/\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const intPart = match[0].replace(/[.,]\d+$/, "").replace(/\D/g, "");
  return intPart || null;
}

/** schema.org URLs for the consumer availability select. */
const CONSUMER_AVAILABILITY: Record<string, string> = {
  Systembolaget: "https://schema.org/InStock",
  "Private Import": "https://schema.org/LimitedAvailability",
  "Sold Out": "https://schema.org/SoldOut",
};

/**
 * Resolve a single schema.org availability from the two channel selects.
 * The restaurant channel can keep a wine "in stock" even when the consumer
 * channel is sold out — mirroring `resolvePurchase` in the product detail slice.
 */
function resolveOfferAvailability(
  consumer: string | null | undefined,
  restaurant: string | null | undefined,
): string | undefined {
  const restaurantAvailable = restaurant === "Available";
  if (consumer === "Sold Out") {
    return restaurantAvailable ? "https://schema.org/InStock" : "https://schema.org/SoldOut";
  }
  if (consumer && CONSUMER_AVAILABILITY[consumer]) return CONSUMER_AVAILABILITY[consumer];
  if (restaurantAvailable) return "https://schema.org/InStock";
  return undefined;
}

/**
 * Generate Product schema (with an Offer) for product documents.
 * Powers price/availability rich results; brand is the linked producer.
 */
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

  const price = parsePrice(data.product_price);
  const availability = resolveOfferAvailability(data.product_consumer_availability, data.product_restaurant_availability);
  // Google requires a price inside an Offer, so only emit the Offer when there is
  // one. Without a price the Product is still valid structured data — it just is
  // not eligible for price/shopping rich results.
  const offers = price
    ? {
        "@type": "Offer",
        price,
        priceCurrency: "SEK",
        ...(availability && { availability }),
        ...(url && { url }),
        itemCondition: "https://schema.org/NewCondition",
      }
    : undefined;

  const origin = [data.product_region, data.product_cru].filter(Boolean).join(", ");
  const dosage = formatDosage(data.product_dosage_grams);
  const alcohol = formatAlcohol(data.product_alcohol);
  const additionalProperty = [
    data.product_grapes && { "@type": "PropertyValue", name: "Druvor", value: data.product_grapes },
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
    ...(offers && { offers }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
  };
}
