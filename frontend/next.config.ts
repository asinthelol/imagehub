import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.0.0.227',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ], // Change for production
  },
};

export default nextConfig;
