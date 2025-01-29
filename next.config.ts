import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const config: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LKH3_SERVICE_URL: process.env.NEXT_PUBLIC_LKH3_SERVICE_URL,
  },
  webpack: (config, { isServer }) => {
    // Leaflet alias for ESM support
    config.resolve.alias = {
      ...config.resolve.alias,
      leaflet: require.resolve("leaflet/dist/leaflet-src.esm.js"),
      "react-leaflet": require.resolve("react-leaflet/dist/react-leaflet.esm.js"),
    };

    // Handle node modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
      };
    }

    // Add raw loader for LKH-3 files
    config.module.rules.push({
      test: /\.(par|vrp)$/i,
      use: 'raw-loader',
    });

    // Add SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  experimental: {
    serverExternalPackages: ['fs-extra', 'lkh3'], // Corrected key name
  },
  turbo: false, // Explicitly disable Turbopack if you want Webpack
};

export default config;
