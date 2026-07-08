export default function DashboardLoading() {
  return (
    <div className="min-h-full p-8 animate-pulse">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Welcome Banner Skeleton */}
        <div className="rounded-2xl border border-violet-500/10 bg-violet-900/20 p-8">
          <div className="h-3 w-24 rounded-full bg-white/10 mb-3" />
          <div className="h-8 w-48 rounded-full bg-white/10 mb-2" />
          <div className="h-3 w-64 rounded-full bg-white/5 mb-6" />
          {/* EXP Bar skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="h-3 w-20 rounded-full bg-white/10" />
            </div>
            <div className="h-3 w-full rounded-full bg-white/10" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5 text-center">
              <div className="h-6 w-6 mx-auto rounded-full bg-white/10 mb-2" />
              <div className="h-6 w-12 mx-auto rounded-full bg-white/10 mb-1" />
              <div className="h-3 w-20 mx-auto rounded-full bg-white/5" />
            </div>
          ))}
        </div>

        {/* Task List Skeleton */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-28 rounded-xl bg-violet-600/30" />
          </div>
          <div className="h-8 w-full rounded-xl bg-white/5 mb-4" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl border border-white/5 bg-white/3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
