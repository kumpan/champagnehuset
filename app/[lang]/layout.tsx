import type { Content } from "@prismicio/client";
import { PrismicPreview } from "@prismicio/next";
import { Mona_Sans } from "next/font/google";
import { CookieBanner } from "@/components/cookie-banner";
import { CookieBannerProvider } from "@/components/cookie-banner-context";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { OrganizationSchema } from "@/components/structured-data";
import { getSingleton } from "@/lib/cms";
import { getLocales, getMasterLocale } from "@/lib/locales";
import { repositoryName } from "@/prismicio";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  axes: ["wdth"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const [navbarData, cookieBanner, locales, masterLocale] = await Promise.all([
    getSingleton<Content.NavbarDocument>("navbar"),
    getSingleton<Content.CookieBannerDocument>("cookie_banner"),
    getLocales(),
    getMasterLocale(),
  ]);

  return (
    <html lang={lang} className={`${monaSans.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        {/* <GoogleTagManager /> */}
        <OrganizationSchema />
        <MotionProvider>
          {navbarData && <Navbar prismicData={navbarData} locales={locales} masterLocale={masterLocale} />}
          <CookieBannerProvider>
            {children}
            {cookieBanner && <CookieBanner prismicData={cookieBanner} />}
          </CookieBannerProvider>
        </MotionProvider>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
