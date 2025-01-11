import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Don't run TypeScript during build for api folder
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Exclude api directory from build
    config.externals = [...(config.externals || []), 'api'];
    return config;
  }
};

export default nextConfig;