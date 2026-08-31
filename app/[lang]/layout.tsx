import type { Content } from "@prismicio/client";
import { PrismicPreview } from "@prismicio/next";
import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { AgeGate } from "@/components/age-gate";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { ModalProvider } from "@/components/modal-context";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { NewsletterModal } from "@/components/newsletter-modal";
import { OrganizationSchema } from "@/components/structured-data";
import { CustomSVG } from "@/components/svg";
import { getSingleton } from "@/lib/cms";
import { getLocalePathsForPath } from "@/lib/locale-paths";
import { getLocales, getMasterLocale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { repositoryName } from "@/prismicio";

const BREAKPOINTS = [
  { label: "base", range: "flex xxs:hidden", theme: "bg-neutral-300 text-neutral-700" },
  { label: "xxs", range: "hidden xxs:max-xs:flex", theme: "bg-stone-300 text-stone-700" },
  { label: "xs", range: "hidden xs:max-sm:flex", theme: "bg-slate-300 text-slate-700" },
  { label: "sm", range: "hidden sm:max-md:flex", theme: "bg-amber-300 text-amber-700" },
  { label: "md", range: "hidden md:max-lg:flex", theme: "bg-orange-300 text-orange-700" },
  { label: "lg", range: "hidden lg:max-xl:flex", theme: "bg-red-300 text-red-700" },
  { label: "xl", range: "hidden xl:max-2xl:flex", theme: "bg-green-300 text-green-700" },
  { label: "2xl", range: "hidden 2xl:max-3xl:flex", theme: "bg-teal-300 text-teal-700" },
  { label: "3xl", range: "hidden 3xl:flex", theme: "bg-blue-300 text-blue-700" },
];

const ResponsiveIndicator = () =>
  BREAKPOINTS.map(({ label, range, theme }) => (
    <div
      key={label}
      className={cn(
        "fixed right-4 bottom-4 z-50 size-10 animate-wiggle-grow items-center justify-center rounded-3 font-medium text-sm",
        range,
        theme,
      )}
    >
      {label}
    </div>
  ));

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
  const pathname = (await headers()).get("x-pathname") ?? "/";

  const [navbarData, cookieBanner, ageGate, newsletter, footerData, locales, masterLocale, localePaths] =
    await Promise.all([
      getSingleton<Content.NavbarDocument>("navbar", { lang }),
      getSingleton<Content.CookieBannerDocument>("cookie_banner", { lang }),
      getSingleton<Content.AgeGateDocument>("age_gate", { lang }),
      getSingleton<Content.NewsletterDocument>("newsletter", { lang }),
      getSingleton<Content.FooterDocument>("footer", { lang }),
      getLocales(),
      getMasterLocale(),
      getLocalePathsForPath(pathname, lang),
    ]);

  const newsletterEnabled = !!newsletter?.data.enabled;
  const newsletterDelaySeconds =
    newsletter?.data.delay_seconds && newsletter.data.delay_seconds > 0 ? newsletter.data.delay_seconds : 10;
  const newsletterDismissDays =
    newsletter?.data.dismiss_days && newsletter.data.dismiss_days > 0 ? newsletter.data.dismiss_days : 5;

  // The navbar is a Client Component, so its logo is inlined here server-side rendering
  const logoColorOverride = navbarData?.data.logo_color === "System Can Override the Logo Color";
  const desktopLogoUrl = navbarData?.data.desktop_logo?.url;
  const mobileLogoUrl = navbarData?.data.mobile_logo?.url;

  return (
    <html
      lang={lang}
      className={`${thePortray.variable} ${ibmPlexSans.variable} h-full bg-fill text-ink antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        <GoogleTagManager gtmId="GTM-TZTKL247" />
        <OrganizationSchema />
        <MotionProvider>
          <ModalProvider
            localeIds={locales.map((l) => l.id)}
            ageGateEnabled={!!ageGate}
            newsletterEnabled={newsletterEnabled}
            newsletterAvailable={!!newsletter}
            newsletterDelaySeconds={newsletterDelaySeconds}
            newsletterDismissDays={newsletterDismissDays}
          >
            {navbarData && (
              <Navbar
                prismicData={navbarData}
                locales={locales}
                masterLocale={masterLocale}
                currentLocale={lang}
                localePaths={localePaths}
                desktopLogo={
                  desktopLogoUrl ? (
                    <CustomSVG
                      src={desktopLogoUrl}
                      processColor={logoColorOverride}
                      title={navbarData.data.desktop_logo.alt}
                      className="hidden h-full w-auto md:block md:text-brand"
                    />
                  ) : null
                }
                mobileLogo={
                  mobileLogoUrl ? (
                    <CustomSVG
                      src={mobileLogoUrl}
                      processColor={logoColorOverride}
                      title={navbarData.data.mobile_logo.alt}
                      className="h-full w-auto text-brand md:hidden"
                    />
                  ) : null
                }
              />
            )}
            {children}
            {cookieBanner && <CookieBanner prismicData={cookieBanner} />}
            {ageGate && <AgeGate prismicData={ageGate} />}
            {newsletter && <NewsletterModal prismicData={newsletter} />}
            {footerData && <Footer prismicData={footerData} />}
          </ModalProvider>
        </MotionProvider>
        {process.env.NODE_ENV !== "production" && <ResponsiveIndicator />}
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
