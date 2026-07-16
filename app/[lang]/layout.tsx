import type { Content } from "@prismicio/client";
import { PrismicPreview } from "@prismicio/next";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { CookieBanner } from "@/components/cookie-banner";
import { CookieBannerProvider } from "@/components/cookie-banner-context";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { OrganizationSchema } from "@/components/structured-data";
import { getSingleton } from "@/lib/cms";
import { getLocales, getMasterLocale } from "@/lib/locales";
import { repositoryName } from "@/prismicio";

const thePortray = localFont({
  variable: "--font-the-portray",
  src: [
    {
      path: "../fonts/ThePortrayRegular.woff2",
      weight: "400",
      style: "normal",
    },
    { path: "../fonts/ThePortrayItalic.woff2", weight: "400", style: "italic" },
  ],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html
      lang={lang}
      className={`${thePortray.variable} ${ibmPlexSans.variable} h-full text-ink antialiased bg-fill`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        {/* <GoogleTagManager /> */}
        <OrganizationSchema />
        <MotionProvider>
          {navbarData && (
            <Navbar
              prismicData={navbarData}
              locales={locales}
              masterLocale={masterLocale}
            />
          )}
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
