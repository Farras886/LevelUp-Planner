import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore"
    ),
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password terlalu panjang"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// ==================== TASK SCHEMAS ====================

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Judul task wajib diisi")
    .max(200, "Judul terlalu panjang"),
  description: z.string().max(1000, "Deskripsi terlalu panjang").optional(),
  due_date: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  category_id: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Judul task wajib diisi")
    .max(200, "Judul terlalu panjang")
    .optional(),
  description: z.string().max(1000, "Deskripsi terlalu panjang").optional(),
  due_date: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  category_id: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
});

export const completeTaskSchema = z.object({
  complete: z.literal(true),
});

// ==================== CATEGORY SCHEMA ====================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna harus hex (contoh: #FF5733)"),
});

// ==================== TYPES ====================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
