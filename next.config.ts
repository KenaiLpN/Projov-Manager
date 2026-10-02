import type { NextConfig } from "next";
import path from "path";

const apiPort = process.env.API_PORT?.trim() || "3333";
const internalApiUrl =
  process.env.INTERNAL_API_URL?.trim() || `http://127.0.0.1:${apiPort}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // A API e suas dependencias pertencem a um pacote separado e sao carregadas
  // em runtime. Inclua-as tambem quando a hospedagem publicar o standalone.
  outputFileTracingIncludes: {
    "/api/**": [
      "./apps/api/dist/**/*",
      "./apps/api/package.json",
      "./apps/api/node_modules/**/*",
      "./apps/api/node_modules/.prisma/client/**/*",
    ],
  },
  transpilePackages: ["primereact", "primeicons"],
  async headers() {
    return [
      {
        // Aplica a todos os recursos (páginas, assets, API routes)
        source: "/(.*)",
        headers: [
          // Força HTTPS por 2 anos, inclui subdomínios e candidata ao preload list
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Evita MIME sniffing (ataques de tipo drive-by)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Fallback para navegadores que não entendem CSP frame-ancestors
          { key: "X-Frame-Options", value: "DENY" },
          // Limita informações enviadas no cabeçalho Referer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Desabilita APIs de hardware desnecessárias
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return {
      beforeFiles: [
        {
          source: "/api/proxy/:path*",
          destination: `${internalApiUrl}/:path*`,
        },
      ],
    };
  },
};
export default nextConfig;
