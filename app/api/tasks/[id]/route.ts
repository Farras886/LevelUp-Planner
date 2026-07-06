import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations";
import { awardExp, updateStreak } from "@/services/gamification.service";
import { calculateNextDueDate } from "@/services/recurrence.service";
import type { RecurrenceRule } from "@/lib/validations";

// PATCH /api/tasks/[id] — Update task (edit atau complete)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Pastikan task milik user ini
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    if (existingTask.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Handle "complete" action khusus
    const isCompletingTask =
      body.status === "DONE" && existingTask.status !== "DONE";

    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Bangun data update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...parsed.data };

    if (parsed.data.due_date) {
      updateData.due_date = new Date(parsed.data.due_date);
    }

    if (isCompletingTask) {
      updateData.completed_at = new Date();
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    // Jika task baru saja diselesaikan → award EXP + handle recurring
    if (isCompletingTask) {
      const [expResult] = await Promise.all([
        awardExp(
          session.user.id,
          existingTask.exp_reward,
          "task_completed",
          id
        ),
        updateStreak(session.user.id),
      ]);

      // Jika recurring → buat task berikutnya secara otomatis
      let nextTask = null;
      if (existingTask.is_recurring && existingTask.recurrence_rule) {
        const nextDueDate = calculateNextDueDate(
          existingTask.due_date,
          existingTask.recurrence_rule as RecurrenceRule
        );

        nextTask = await prisma.task.create({
          data: {
            user_id: existingTask.user_id,
            title: existingTask.title,
            description: existingTask.description,
            category_id: existingTask.category_id,
            due_date: nextDueDate,
            priority: existingTask.priority,
            is_recurring: true,
            recurrence_rule: existingTask.recurrence_rule,
            exp_reward: existingTask.exp_reward,
            status: "PENDING",
          },
          include: { category: true },
        });
      }

      return NextResponse.json({
        data: updatedTask,
        expGained: expResult.expGained,
        leveledUp: expResult.leveledUp,
        newLevel: expResult.newLevel,
        stats: expResult.stats,
        nextTask, // task baru yang dibuat otomatis (null jika bukan recurring)
      });
    }

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] — Hapus task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    if (existingTask.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus task" }, { status: 500 });
  }
}
