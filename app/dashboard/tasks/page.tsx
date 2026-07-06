import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskListWrapper from "@/components/dashboard/TaskListWrapper";

export const metadata: Metadata = {
  title: "Semua Task — LevelUp Planner",
  description: "Kelola semua task produktivitas kamu.",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Semua Task 📋</h1>
          <p className="mt-1 text-sm text-slate-400">
            Kelola dan selesaikan task-task kamu untuk mendapatkan EXP
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
          <TaskListWrapper />
        </div>
      </div>
    </div>
  );
}
