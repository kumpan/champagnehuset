import type { Content, ImageField, RichTextField } from "@prismicio/client";
import { asImageSrc, asText } from "@prismicio/client";
import type { BreadcrumbItem } from "./breadcrumbs";
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
    ...(doc.data.meta_description && { description: doc.data.meta_description }),
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

/**
 * Generate WebSite schema with search action.
 * Helps Google understand site structure and enables sitelinks search box.
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORGANIZATION_CONFIG.name,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
