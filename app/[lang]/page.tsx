import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqSchema } from "@/components/structured-data";
import { buildPageMetadata } from "@/lib/metadata";
import { hasPaginatedListing, parsePageParam } from "@/lib/pagination";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type SearchParams = { page?: string | string[] };
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<SearchParams> };

const fetchHome = async (lang: string) => {
  const client = await createClient();
  return client.getByUID("page", "home", { lang }).catch(() => null);
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ lang }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = await fetchHome(lang);
  const pageNumber = page && hasPaginatedListing(page.data.slices) ? parsePageParam(pageParam) : 1;
  return buildPageMetadata(page, pageNumber);
}

export default async function HomePage({ params, searchParams }: Props) {
  const [{ lang }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const currentPage = parsePageParam(pageParam);
  const page = await fetchHome(lang);

  if (!page) return notFound();

  return (
    <>
      <FaqSchema slices={page.data.slices} />
      <SliceZone slices={page.data.slices} components={components} context={{ lang, page: currentPage }} />
    </>
  );
}

export async function generateStaticParams() {
  const client = await createClient();
  const pages = await client.getAllByType("page", { lang: "*" });
  return pages.filter((p) => p.uid === "home").map((p) => ({ lang: p.lang }));
}
