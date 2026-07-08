import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Kalender — LevelUp Planner",
  description: "Lihat semua task kamu dalam tampilan kalender bulanan.",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  // Load 3 bulan sekaligus (prev, current, next) agar navigasi bulan tidak perlu fetch ulang
  const startRange = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endRange = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  const tasks = await prisma.task.findMany({
    where: {
      user_id: session.user.id,
      due_date: { gte: startRange, lte: endRange },
    },
    select: {
      id: true,
      title: true,
      due_date: true,
      status: true,
      priority: true,
    },
    orderBy: { due_date: "asc" },
  });

  // Serialize dates untuk client component
  const serializedTasks = tasks.map((t) => ({
    ...t,
    due_date: t.due_date.toISOString(),
  }));

  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kalender 📅</h1>
          <p className="mt-1 text-sm text-slate-400">
            Semua task kamu dalam tampilan bulanan
          </p>
        </div>
        <CalendarView tasks={serializedTasks} />
      </div>
    </div>
  );
}
