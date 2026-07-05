import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js convention) untuk Prisma CLI
config({ path: ".env.local" });

export default defineConfig({
  datasource: {
    // Untuk prisma db push/migrate: wajib pakai direct/session pooler (port 5432)
    // bukan transaction pooler (port 6543) yang tidak support DDL
    url: process.env.DIRECT_URL!,
  },
});
