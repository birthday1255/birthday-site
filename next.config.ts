import type { NextConfig } from "next";

/**
 * Next.js configuration.
 * No secrets here — all runtime values come from env vars loaded by Vercel.
 */
const nextConfig: NextConfig = {
  // Enables additional React checks in development.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Allow Google profile photos served by Firebase Auth.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
