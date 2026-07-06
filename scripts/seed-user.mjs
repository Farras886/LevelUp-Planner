/**
 * Script untuk membuat akun dummy
 * Jalankan: node scripts/seed-user.mjs
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "demo@levelup.com";
  const username = "DemoHero";
  const password = "demo12345";

  // Hapus user lama jika ada (bersih)
  await prisma.user.deleteMany({ where: { email } });

  // Hash password
  const password_hash = await bcrypt.hash(password, 12);

  // Buat user + UserStats dalam satu transaksi
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, username, password_hash },
    });

    await tx.userStats.create({
      data: {
        user_id: newUser.id,
        level: 1,
        current_exp: 0,
        exp_to_next: 100,
        total_exp: 0,
        streak_count: 0,
      },
    });

    return newUser;
  });

  console.log("✅ Akun dummy berhasil dibuat!");
  console.log("─────────────────────────────");
  console.log(`  Email    : ${email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Username : ${username}`);
  console.log(`  User ID  : ${user.id}`);
  console.log("─────────────────────────────");
  console.log("Buka http://localhost:3000/login dan masuk!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
