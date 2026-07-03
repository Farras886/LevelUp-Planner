import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard — LevelUp Planner",
  description: "Dashboard produktivitas dan level kamu di LevelUp Planner.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-lg font-bold text-white">LevelUp Planner</span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              id="logout-btn"
              type="submit"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              Keluar
            </button>
          </form>
        </div>

        {/* Welcome card */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/30 to-indigo-900/30 p-8 backdrop-blur-xl">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />
          <div className="relative">
            <div className="mb-2 text-sm font-medium text-violet-400">
              Level 1 Adventurer
            </div>
            <h1 className="text-3xl font-bold text-white">
              Halo, {session.user?.name}! 👋
            </h1>
            <p className="mt-2 text-slate-400">
              Akun berhasil dibuat. Dashboard task management akan hadir di Tahap 2!
            </p>

            {/* EXP Bar placeholder */}
            <div className="mt-6">
              <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                <span>Level 1</span>
                <span>0 / 100 EXP</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "Task Selesai", value: "0", icon: "✅" },
            { label: "Streak Hari", value: "0", icon: "🔥" },
            { label: "Total EXP", value: "0", icon: "⭐" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Tahap 2 (Task Management) & Tahap 3 (Gamification Engine) coming soon
        </p>
      </div>
    </div>
  );
}
