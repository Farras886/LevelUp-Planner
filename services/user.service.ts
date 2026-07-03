import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

/**
 * Buat user baru + otomatis buat UserStats default (level 1, exp 0)
 */
export async function createUser(
  email: string,
  username: string,
  password: string
) {
  // Cek email sudah terdaftar
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // Gunakan transaction: user + userStats dibuat bersama-sama atau rollback semua
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        username,
        password_hash,
      },
    });

    // Otomatis buat UserStats default
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

  return user;
}

/**
 * Ambil user berdasarkan email (untuk auth)
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { stats: true },
  });
}

/**
 * Verifikasi password
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
