import type { NextConfig } from "next";
import path from "path";
const isDev = process.env.NODE_ENV !== "production";
const API_URL = isDev
  ? "http://127.0.0.1:3333"
  : process.env.NEXT_PUBLIC_API_URL?.trim() || "https://bot-api-ff.vercel.app";
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["primereact", "primeicons"],
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${API_URL}/:path*`, // Local: http://localhost:3333/:path* | Prod: Vercel
      },
    ];
  },
};
export default nextConfig;