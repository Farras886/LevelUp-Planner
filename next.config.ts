import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Optimalkan images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Optimasi import size — hanya bundle yang dipakai
    optimizePackageImports: ["react-hook-form", "@hookform/resolvers"],
  },
};

export default nextConfig;
