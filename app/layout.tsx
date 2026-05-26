import "./globals.css";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Champagnehuset",
    default: "Champagnehuset",
  },
  description: "Små odlare, stora champagner. Handplockade champagner från självständiga odlare i Champagne.",
  openGraph: {
    title: {
      template: "%s | Champagnehuset",
      default: "Champagnehuset",
    },
    type: "website",
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | Champagnehuset",
      default: "Champagnehuset",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
