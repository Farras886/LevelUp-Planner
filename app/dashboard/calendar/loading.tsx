export default function CalendarLoading() {
  return (
    <div className="min-h-full p-8 animate-pulse">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Title skeleton */}
        <div>
          <div className="h-7 w-36 rounded-full bg-white/10 mb-2" />
          <div className="h-3 w-52 rounded-full bg-white/5" />
        </div>

        {/* Calendar card skeleton */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-8 rounded-lg bg-white/10" />
            <div className="h-5 w-36 rounded-full bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-white/10" />
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-3 mx-1 rounded-full bg-white/5" />
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
