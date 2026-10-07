import type { NextConfig } from "next";
const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: { proxyTimeout: 90000 },
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL ||
      (process.env.BACKEND_HOST
        ? `https://${process.env.BACKEND_HOST}`
        : "http://127.0.0.1:8000")
    ).replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};
export default config;
