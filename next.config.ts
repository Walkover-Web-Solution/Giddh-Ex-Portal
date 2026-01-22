import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/magic.html",
        destination: "/magic",
      },
    ];
  },
};

export default nextConfig;
