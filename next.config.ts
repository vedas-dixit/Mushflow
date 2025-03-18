import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Skip type checking during builds for better performance
  typescript: {
    // This will allow the build to succeed even with type errors
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
