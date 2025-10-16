import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve("./node_modules"),
      path.resolve("../node_modules"),
    ];
    return config;
  },
};

export default nextConfig;
