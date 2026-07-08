interface ExpBarProps {
  level: number;
  currentExp: number;
  expToNext: number;
  totalExp: number;
  animated?: boolean;
}

// Nama kelas level berdasarkan level angka
function getLevelTitle(level: number): string {
  if (level <= 3) return "Adventurer";
  if (level <= 7) return "Explorer";
  if (level <= 12) return "Champion";
  if (level <= 18) return "Legend";
  if (level <= 25) return "Mythic";
  return "Transcendent";
}

// Warna gradient berdasarkan level
function getLevelColors(level: number): {
  from: string;
  to: string;
  shadow: string;
} {
  if (level <= 3) return { from: "#8b5cf6", to: "#6366f1", shadow: "rgba(139,92,246,0.4)" };
  if (level <= 7) return { from: "#06b6d4", to: "#3b82f6", shadow: "rgba(6,182,212,0.4)" };
  if (level <= 12) return { from: "#10b981", to: "#06b6d4", shadow: "rgba(16,185,129,0.4)" };
  if (level <= 18) return { from: "#f59e0b", to: "#ef4444", shadow: "rgba(245,158,11,0.4)" };
  if (level <= 25) return { from: "#ec4899", to: "#8b5cf6", shadow: "rgba(236,72,153,0.4)" };
  return { from: "#fbbf24", to: "#f59e0b", shadow: "rgba(251,191,36,0.4)" };
}

export default function ExpBar({
  level,
  currentExp,
  expToNext,
  totalExp,
}: ExpBarProps) {
  const percentage = Math.min((currentExp / expToNext) * 100, 100);
  const title = getLevelTitle(level);
  const colors = getLevelColors(level);

  return (
    <div className="space-y-3">
      {/* Level badge + title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              boxShadow: `0 4px 14px ${colors.shadow}`,
            }}
          >
            {level}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Level {level}
            </div>
            <div className="text-base font-bold text-white">{title}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Total EXP</div>
          <div className="text-sm font-semibold text-slate-300">
            {totalExp.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>{currentExp.toLocaleString()} EXP</span>
          <span>{expToNext.toLocaleString()} EXP</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-sm"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            }}
          />
          {/* Main bar */}
          <div
            className="relative h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            }}
          >
            {/* Shimmer */}
            {percentage > 5 && (
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-1 text-right text-xs text-slate-600">
          {percentage.toFixed(1)}% menuju Level {level + 1}
        </div>
      </div>
    </div>
  );
}
