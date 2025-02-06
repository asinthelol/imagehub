import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: [
      "10.0.0.227",
      "localhost",
    ], // Change for production
  },
};

export default nextConfig;
