import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", id: "nav-dashboard" },
  { href: "/dashboard/tasks", label: "Semua Task", icon: "📋", id: "nav-tasks" },
  { href: "/dashboard/calendar", label: "Kalender", icon: "📅", id: "nav-calendar" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-white/5 bg-white/2 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
            <span className="text-lg">⚡</span>
          </div>
          <span className="text-base font-bold text-white">LevelUp Planner</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-white/5 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              {session.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{session.user?.name}</p>
              <p className="truncate text-xs text-slate-500">{session.user?.email}</p>
            </div>
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
              className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
