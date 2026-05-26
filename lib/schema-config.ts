export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://champagnehuset.se";

export const ORGANIZATION_CONFIG = {
  name: "Champagnehuset",
  alternateName: "Champagnehuset Stockholm",
  description: "Små odlare, stora champagner. Handplockade champagner från självständiga odlare i Champagne.",
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512x512.png`,
  foundingDate: "2024", // TODO: confirm founding year

  contactPoint: {
    email: "info@champagnehuset.se",
    contactType: "Customer Support",
    availableLanguage: ["Swedish", "English"],
    areaServed: "SE",
  },

  address: {
    streetAddress: "Kungsgatan 50",
    postalCode: "111 35",
    addressLocality: "Stockholm",
    addressCountry: "SE",
  },

  sameAs: [
    // TODO: add the verified Facebook and Instagram URLs
    // "https://www.facebook.com/champagnehuset",
    // "https://www.instagram.com/champagnehuset",
  ],
} as const;
