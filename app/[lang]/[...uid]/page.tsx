import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailableLocalesSetter } from "@/components/available-locales-setter";
import { ArticleSchema, BreadcrumbSchema, FaqSchema, ProductSchema } from "@/components/structured-data";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { getDocumentByUID, isArticle, isProduct } from "@/lib/cms";
import { buildPageMetadata } from "@/lib/metadata";
import { hasPaginatedListing, parsePageParam } from "@/lib/pagination";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Params = { lang: string; uid: string[] };
type SearchParams = { page?: string | string[] };
type Props = { params: Promise<Params>; searchParams: Promise<SearchParams> };

const fetchPage = async (uid: string[], lang: string) => {
  const client = await createClient();
  const pageUid = uid[uid.length - 1];
  return getDocumentByUID(pageUid, client, lang);
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ lang, uid }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = await fetchPage(uid, lang);
  const pageNumber = page && hasPaginatedListing(page.data.slices) ? parsePageParam(pageParam) : 1;
  return buildPageMetadata(page, pageNumber);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ lang, uid }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const currentPage = parsePageParam(pageParam);
  const client = await createClient();

  const pageUid = uid[uid.length - 1];
  const page = await getDocumentByUID(pageUid, client, lang);

  if (!page) return notFound();

  // Strip /:lang prefix from the Prismic-resolved URL before comparing to the
  // requested path so /en-gb/about and /sv-se/om-oss both resolve correctly.
  const canonicalPath = page.url ?? null;
  if (canonicalPath) {
    const canonicalWithoutLang = canonicalPath.replace(new RegExp(`^/${lang}(?=/|$)`), "") || "/";
    const requestedPath = `/${uid.join("/")}`;
    if (canonicalWithoutLang !== requestedPath) return notFound();
  }

  const breadcrumbs = await buildBreadcrumbs(page, client);
  const availableLocales = [page.lang, ...page.alternate_languages.map((a) => a.lang)];

  return (
    <>
      <AvailableLocalesSetter locales={availableLocales} />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      {isArticle(page) && <ArticleSchema doc={page} />}
      {isProduct(page) && <ProductSchema doc={page} />}
      <FaqSchema slices={page.data.slices} />
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={{ breadcrumbs, lang, document: page, page: currentPage }}
      />
    </>
  );
}

export async function generateStaticParams() {
  const client = await createClient();
  const [pages, articles, products, producers] = await Promise.all([
    client.getAllByType("page", { lang: "*" }),
    client.getAllByType("article", { lang: "*" }),
    client.getAllByType("product", { lang: "*" }),
    client.getAllByType("producer", { lang: "*" }),
  ]);

  return [...pages, ...articles, ...products, ...producers]
    .filter((doc) => doc.uid !== "home")
    .map((doc) => {
      const url = doc.url ?? `/${doc.lang}/${doc.uid}`;
      const withoutLang = url.replace(new RegExp(`^/${doc.lang}(?=/|$)`), "") || "/";
      const segments = withoutLang.replace(/^\//, "").split("/").filter(Boolean);
      return { lang: doc.lang, uid: segments };
    });
}
