import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailableLocalesSetter } from "@/components/available-locales-setter";
import { FaqSchema } from "@/components/structured-data";
import { buildPageMetadata } from "@/lib/metadata";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Props = { params: Promise<{ lang: string }> };

const fetchHome = async (lang: string) => {
  const client = await createClient();
  return client.getByUID("page", "home", { lang }).catch(() => null);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const page = await fetchHome(lang);
  return buildPageMetadata(page);
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  const page = await fetchHome(lang);

  if (!page) return notFound();

  const availableLocales = [page.lang, ...page.alternate_languages.map((a) => a.lang)];

  return (
    <>
      <AvailableLocalesSetter locales={availableLocales} />
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
