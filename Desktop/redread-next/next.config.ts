import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent static generation errors when env vars are missing at build time
  output: "standalone",
};

export default nextConfig;
