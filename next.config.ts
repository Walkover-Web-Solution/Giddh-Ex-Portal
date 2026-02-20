import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:company/:country/invoice-preview",
        destination: "/:company/:country/invoice/preview",
        permanent: false,
      },
    ];
  },
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
