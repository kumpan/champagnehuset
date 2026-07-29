export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://champagnehuset.se";

export const ORGANIZATION_CONFIG = {
  name: "ChampagneHuset",
  alternateName: "ChampagneHuset Stockholm",
  description: "Små odlare, stora champagner. Handplockade champagner från självständiga odlare i Champagne.",
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512x512.png`,
  foundingDate: "2002",

  contactPoint: {
    telephone: "+46 70 724 34 74",
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

  sameAs: ["https://www.instagram.com/champagnehuset/"],
} as const;
