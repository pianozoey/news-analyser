import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["playwright", "playwright-extra", "puppeteer-extra-plugin-stealth"]
};

export default nextConfig;
