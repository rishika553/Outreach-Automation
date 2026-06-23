import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence the multiple-lockfile warning from Turbopack
  // by telling it this project's root is the saas subfolder
  experimental: {
    // nothing needed yet
  },
};

export default nextConfig;
