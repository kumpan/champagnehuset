import type { Content } from "@prismicio/client";
import { PrismicPreview } from "@prismicio/next";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { AgeGate } from "@/components/age-gate";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { ModalProvider } from "@/components/modal-context";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { NewsletterModal } from "@/components/newsletter-modal";
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

  const [navbarData, cookieBanner, ageGate, newsletter, footerData, locales, masterLocale] = await Promise.all([
    getSingleton<Content.NavbarDocument>("navbar"),
    getSingleton<Content.CookieBannerDocument>("cookie_banner"),
    getSingleton<Content.AgeGateDocument>("age_gate"),
    getSingleton<Content.NewsletterDocument>("newsletter"),
    getSingleton<Content.FooterDocument>("footer"),
    getLocales(),
    getMasterLocale(),
  ]);

  const newsletterEnabled = !!newsletter?.data.enabled;
  const newsletterDelaySeconds =
    newsletter?.data.delay_seconds && newsletter.data.delay_seconds > 0 ? newsletter.data.delay_seconds : 45;

  return (
    <html
      lang={lang}
      className={`${thePortray.variable} ${ibmPlexSans.variable} h-full bg-fill text-ink antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        {/* <GoogleTagManager /> */}
        <OrganizationSchema />
        <MotionProvider>
          <ModalProvider
            localeIds={locales.map((l) => l.id)}
            ageGateEnabled={!!ageGate}
            newsletterEnabled={newsletterEnabled}
            newsletterDelaySeconds={newsletterDelaySeconds}
          >
            {navbarData && <Navbar prismicData={navbarData} locales={locales} masterLocale={masterLocale} />}
            {children}
            {cookieBanner && <CookieBanner prismicData={cookieBanner} />}
            {ageGate && <AgeGate prismicData={ageGate} />}
            {newsletter && <NewsletterModal prismicData={newsletter} />}
            {footerData && <Footer prismicData={footerData} />}
          </ModalProvider>
        </MotionProvider>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
