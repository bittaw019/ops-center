export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
    </div>
  );
}
