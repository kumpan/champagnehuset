import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqSchema } from "@/components/structured-data";
import { buildPageMetadata } from "@/lib/metadata";
import { type ListingSearchParams, listingParamsForMetadata } from "@/lib/pagination";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<ListingSearchParams> };

const fetchHome = async (lang: string) => {
  const client = await createClient();
  return client.getByUID("page", "home", { lang }).catch(() => null);
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ lang }, search] = await Promise.all([params, searchParams]);
  const page = await fetchHome(lang);
  return buildPageMetadata(page, listingParamsForMetadata(page?.data.slices ?? [], search));
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const page = await fetchHome(lang);

  if (!page) return notFound();

  return (
    <>
      <FaqSchema slices={page.data.slices} />
      <SliceZone slices={page.data.slices} components={components} context={{ lang }} />
    </>
  );
}

export async function generateStaticParams() {
  const client = await createClient();
  const pages = await client.getAllByType("page", { lang: "*" });
  return pages.filter((p) => p.uid === "home").map((p) => ({ lang: p.lang }));
}
