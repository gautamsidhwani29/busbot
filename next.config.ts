import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LKH3_SERVICE_URL: process.env.NEXT_PUBLIC_LKH3_SERVICE_URL,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      leaflet: require.resolve("leaflet/dist/leaflet-src.esm.js"),
    };

    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }

    return config;
  },
};

export default config;
