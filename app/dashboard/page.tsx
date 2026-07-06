import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExpBar from "@/components/dashboard/ExpBar";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TaskListWrapper from "@/components/dashboard/TaskListWrapper";

export const metadata: Metadata = {
  title: "Dashboard — LevelUp Planner",
  description: "Dashboard produktivitas dan level kamu di LevelUp Planner.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Ambil UserStats dari DB
  const stats = await prisma.userStats.findUnique({
    where: { user_id: session.user.id },
  });

  if (!stats) redirect("/login");

  // Hitung task selesai hari ini
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const completedToday = await prisma.task.count({
    where: {
      user_id: session.user.id,
      status: "DONE",
      completed_at: { gte: todayStart, lte: todayEnd },
    },
  });

  // Ambil 3 task hari ini yang belum selesai
  const todayTasks = await prisma.task.count({
    where: {
      user_id: session.user.id,
      due_date: { gte: todayStart, lte: todayEnd },
    },
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 17) return "Selamat siang";
    return "Selamat malam";
  };

  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/40 to-indigo-900/30 p-8 backdrop-blur-xl">
          {/* Background orbs */}
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-indigo-500/15 blur-[60px]" />

          <div className="relative">
            <p className="text-sm font-medium text-violet-400">{greeting()},</p>
            <h1 className="mt-1 text-3xl font-bold text-white">
              {session.user?.name}! 👋
            </h1>
            <p className="mt-1.5 text-slate-400">
              {todayTasks > 0
                ? `Kamu punya ${todayTasks} task hari ini. Selesaikan dan naik level!`
                : "Belum ada task hari ini. Tambahkan task pertamamu!"}
            </p>

            {/* EXP Bar */}
            <div className="mt-6">
              <ExpBar
                level={stats.level}
                currentExp={stats.current_exp}
                expToNext={stats.exp_to_next}
                totalExp={stats.total_exp}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid
          completedToday={completedToday}
          streakCount={stats.streak_count}
          totalExp={stats.total_exp}
        />

        {/* Task List — Client Component */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
          <TaskListWrapper />
        </div>

      </div>
    </div>
  );
}
