import type { RecurrenceRule } from "@/lib/validations";

/**
 * Hitung tanggal berikutnya berdasarkan recurrence rule.
 * Menggunakan due_date task yang baru saja selesai sebagai basis,
 * bukan tanggal hari ini, agar tidak terjadi drift tanggal.
 *
 * @example
 * - DAILY  : 2026-07-06 → 2026-07-07
 * - WEEKLY : 2026-07-06 → 2026-07-13
 * - MONTHLY: 2026-07-06 → 2026-08-06
 * - YEARLY : 2026-07-06 → 2027-07-06
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  rule: RecurrenceRule
): Date {
  const next = new Date(currentDueDate);

  switch (rule) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Label display untuk recurrence rule
 */
export const recurrenceLabel: Record<RecurrenceRule, string> = {
  DAILY: "Setiap Hari",
  WEEKLY: "Setiap Minggu",
  MONTHLY: "Setiap Bulan",
  YEARLY: "Setiap Tahun",
};

/**
 * Icon untuk recurrence rule
 */
export const recurrenceIcon: Record<RecurrenceRule, string> = {
  DAILY: "🔁",
  WEEKLY: "📆",
  MONTHLY: "🗓️",
  YEARLY: "🎯",
};
