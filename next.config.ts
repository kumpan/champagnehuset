import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows a second dev server in the same folder (the dev lock lives in distDir).
  distDir: process.env.NEXT_DIST_DIR,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
      },
      {
        protocol: "https",
        hostname: "*.prismic.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: ["192.168.0.160"],
};

export default nextConfig;
