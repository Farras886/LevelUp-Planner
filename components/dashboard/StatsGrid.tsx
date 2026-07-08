interface StatsGridProps {
  completedToday: number;
  streakCount: number;
  totalExp: number;
  totalTasks?: number;
}

const stats = (data: StatsGridProps) => [
  {
    id: "completed-today",
    label: "Selesai Hari Ini",
    value: data.completedToday,
    icon: "✅",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  {
    id: "streak",
    label: "Streak Hari",
    value: data.streakCount,
    icon: "🔥",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
  },
  {
    id: "total-exp",
    label: "Total EXP",
    value: data.totalExp.toLocaleString(),
    icon: "⭐",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
  },
];

export default function StatsGrid(props: StatsGridProps) {
  const items = stats(props);

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((stat) => (
        <div
          key={stat.id}
          id={`stat-${stat.id}`}
          className={`relative overflow-hidden rounded-xl border ${stat.border} bg-gradient-to-br ${stat.color} p-5 text-center backdrop-blur-xl transition-all hover:scale-105`}
        >
          <div className="text-2xl">{stat.icon}</div>
          <div className={`mt-2 text-2xl font-bold ${stat.text}`}>
            {stat.value}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
