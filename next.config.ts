import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows a second dev server in the same folder (the dev lock lives in distDir).
  distDir: process.env.NEXT_DIST_DIR,
  images: {
    // Define the src set, max img src 2560
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
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
