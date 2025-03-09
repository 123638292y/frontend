import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Si vous utilisez un serveur personnalisé
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

export default nextConfig;
