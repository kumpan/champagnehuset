import { IBM_Plex_Sans } from "next/font/google";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion-provider";

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

export default function SliceSimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${thePortray.variable} ${ibmPlexSans.variable} antialiased`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
