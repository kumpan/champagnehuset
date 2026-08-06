import "./globals.css";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/schema-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | ChampagneHuset",
    default: "ChampagneHuset",
  },
  description: "Små odlare, stora champagner. Handplockade champagner från självständiga odlare i Champagne.",
  openGraph: {
    title: {
      template: "%s | ChampagneHuset",
      default: "ChampagneHuset",
    },
    type: "website",
    locale: "sv_SE",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: DEFAULT_OG_IMAGE }],
    title: {
      template: "%s | ChampagneHuset",
      default: "ChampagneHuset",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
