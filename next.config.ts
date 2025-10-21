import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve("./node_modules"),
      path.resolve("../node_modules"),
    ];
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
