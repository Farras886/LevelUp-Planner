import { prisma } from "@/lib/prisma";

/**
 * Formula EXP untuk naik level:
 * exp_to_next = Math.floor(100 * level^1.5)
 * Level 1 → 100 EXP
 * Level 2 → 283 EXP
 * Level 5 → 1118 EXP
 */
export function calculateExpToNext(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Tambahkan EXP ke user dan catat di ExpLog.
 * Setelah itu cek apakah user naik level.
 * Mengembalikan { expGained, leveledUp, newLevel, stats }
 */
export async function awardExp(
  userId: string,
  amount: number,
  reason: string,
  taskId?: string
): Promise<{
  expGained: number;
  leveledUp: boolean;
  newLevel: number;
  stats: {
    level: number;
    current_exp: number;
    exp_to_next: number;
    total_exp: number;
    streak_count: number;
  };
}> {
  // Ambil stats user saat ini
  const stats = await prisma.userStats.findUnique({
    where: { user_id: userId },
  });

  if (!stats) {
    throw new Error("UserStats tidak ditemukan");
  }

  // Catat di ExpLog
  await prisma.expLog.create({
    data: {
      user_id: userId,
      task_id: taskId ?? null,
      exp_gained: amount,
      reason,
    },
  });

  // Hitung EXP baru
  const newCurrentExp = stats.current_exp + amount;
  const newTotalExp = stats.total_exp + amount;

  // Cek level up
  let { level } = stats;
  let currentExp = newCurrentExp;
  let expToNext = stats.exp_to_next;
  let leveledUp = false;

  while (currentExp >= expToNext) {
    currentExp -= expToNext;
    level += 1;
    expToNext = calculateExpToNext(level);
    leveledUp = true;
  }

  // Update UserStats
  const updatedStats = await prisma.userStats.update({
    where: { user_id: userId },
    data: {
      level,
      current_exp: currentExp,
      exp_to_next: expToNext,
      total_exp: newTotalExp,
      last_active: new Date(),
    },
  });

  return {
    expGained: amount,
    leveledUp,
    newLevel: level,
    stats: {
      level: updatedStats.level,
      current_exp: updatedStats.current_exp,
      exp_to_next: updatedStats.exp_to_next,
      total_exp: updatedStats.total_exp,
      streak_count: updatedStats.streak_count,
    },
  };
}

/**
 * Hitung EXP reward berdasarkan prioritas task
 */
export function getExpReward(priority: "LOW" | "MEDIUM" | "HIGH"): number {
  const rewards = {
    LOW: 10,
    MEDIUM: 20,
    HIGH: 35,
  };
  return rewards[priority];
}

/**
 * Update streak user.
 * Streak naik jika last_active adalah kemarin.
 * Streak reset jika last_active lebih dari 1 hari lalu.
 */
export async function updateStreak(userId: string): Promise<number> {
  const stats = await prisma.userStats.findUnique({
    where: { user_id: userId },
  });

  if (!stats) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let newStreak = stats.streak_count;

  if (stats.last_active) {
    const lastActiveDate = new Date(
      stats.last_active.getFullYear(),
      stats.last_active.getMonth(),
      stats.last_active.getDate()
    );

    const diffDays = Math.floor(
      (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // Sudah aktif hari ini, streak tidak berubah
      newStreak = stats.streak_count;
    } else if (diffDays === 1) {
      // Aktif kemarin → streak lanjut
      newStreak = stats.streak_count + 1;
    } else {
      // Lebih dari 1 hari tidak aktif → reset
      newStreak = 1;
    }
  } else {
    // Belum pernah aktif → mulai streak 1
    newStreak = 1;
  }

  await prisma.userStats.update({
    where: { user_id: userId },
    data: { streak_count: newStreak },
  });

  return newStreak;
}
