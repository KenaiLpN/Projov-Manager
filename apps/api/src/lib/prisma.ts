import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatasourceUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT?.trim();
  if (!databaseUrl || !connectionLimit) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", connectionLimit);
    }
    return url.toString();
  } catch {
    console.warn(
      "[Prisma] DATABASE_URL nao pode ser ajustada automaticamente; use connection_limit na URL.",
    );
    return databaseUrl;
  }
}

const datasourceUrl = getDatasourceUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "warn"],
    ...(datasourceUrl
      ? {
          datasources: {
            db: { url: datasourceUrl },
          },
        }
      : {}),
  });

globalForPrisma.prisma = prisma;
