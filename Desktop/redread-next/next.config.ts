import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  // Prevent static generation errors when env vars are missing at build time
  output: "standalone",
};

export default nextConfig;
