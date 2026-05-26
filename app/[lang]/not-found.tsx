import type { Content } from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { headers } from "next/headers";
import { CustomRichText } from "@/components/custom-rich-text";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { getSingleton } from "@/lib/cms";
import { getMasterLocale } from "@/lib/locales";
import { components } from "@/slices";

async function getLang() {
  const h = await headers();
  return h.get("x-locale") ?? (await getMasterLocale());
}

async function getNotFoundPage(lang: string) {
  return getSingleton<Content.FourOhFourDocument>("four_oh_four", { lang });
}

export default async function NotFound() {
  const lang = await getLang();
  const notFoundPage = await getNotFoundPage(lang);

  const sectionClasses = "flex min-h-144 items-center pt-32 pb-32 md:pt-48 md:pb-40 lg:pt-56 lg:pb-48 border-t-0";
  const containerClasses = "flex items-center justify-center text-center";

  if (!notFoundPage) {
    return (
      <main>
        <Section className={sectionClasses}>
          <Container className={containerClasses}>
            <h1 className="max-w-2xl font-bold text-4xl">404 — Page not found</h1>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <main>
      {isFilled.richText(notFoundPage.data.content) && (
        <Section className={sectionClasses}>
          <Container className={containerClasses}>
            <CustomRichText className="max-w-2xl" field={notFoundPage.data.content} />
          </Container>
        </Section>
      )}
      <SliceZone slices={notFoundPage.data.slices} components={components} />
    </main>
  );
}
