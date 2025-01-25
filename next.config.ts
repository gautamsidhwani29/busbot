import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      leaflet: require.resolve("leaflet/dist/leaflet-src.esm.js"),
    };
    return config;
  },
};

export default config;
