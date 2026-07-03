import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Prisma 7: datasourceUrl dipasang di prisma.config.ts,
    // PrismaClient otomatis membacanya dari sana
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
