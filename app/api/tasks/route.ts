import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations";
import { getExpReward } from "@/services/gamification.service";

// GET /api/tasks — Ambil semua task user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // format: YYYY-MM-DD
  const statusParam = searchParams.get("status"); // PENDING | IN_PROGRESS | DONE | all

  try {
    // Bangun filter where
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { user_id: session.user.id };

    if (dateParam) {
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);
      where.due_date = { gte: startOfDay, lte: endOfDay };
    }

    if (statusParam && statusParam !== "all") {
      where.status = statusParam;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { category: true },
      orderBy: [
        { status: "asc" }, // DONE di bawah
        { priority: "desc" }, // HIGH di atas
        { due_date: "asc" },
      ],
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Gagal mengambil task" }, { status: 500 });
  }
}

// POST /api/tasks — Buat task baru
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, due_date, priority, category_id, is_recurring, recurrence_rule } = parsed.data;

    // Hitung exp_reward berdasarkan prioritas
    // Recurring task dapat +5 EXP bonus sebagai insentif konsistensi
    const baseExpReward = getExpReward(priority);
    const expReward = is_recurring ? baseExpReward + 5 : baseExpReward;

    const task = await prisma.task.create({
      data: {
        user_id: session.user.id,
        title,
        description: description ?? null,
        due_date: new Date(due_date),
        priority,
        category_id: category_id ?? null,
        exp_reward: expReward,
        is_recurring: is_recurring ?? false,
        recurrence_rule: is_recurring ? (recurrence_rule ?? null) : null,
      },
      include: { category: true },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Gagal membuat task" }, { status: 500 });
  }
}
