export default function TasksLoading() {
  return (
    <div className="min-h-full p-8 animate-pulse">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="h-7 w-36 rounded-full bg-white/10 mb-2" />
          <div className="h-3 w-52 rounded-full bg-white/5" />
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-28 rounded-xl bg-violet-600/30" />
          </div>
          <div className="h-8 w-full rounded-xl bg-white/5 mb-4" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl border border-white/5 bg-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
