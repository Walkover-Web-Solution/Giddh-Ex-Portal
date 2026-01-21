import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ❌ do NOT add output: 'export'
  // ❌ do NOT force edge runtime unless required
};

export default nextConfig;
