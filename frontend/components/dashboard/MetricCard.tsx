interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  change?: string;
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  color = "from-cyan-500 to-blue-500",
  change,
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg transition hover:scale-[1.02] hover:border-cyan-500">
      <div
        className={`absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br ${color} opacity-20 blur-3xl`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
            {unit && (
              <span className="ml-1 text-lg text-slate-400">{unit}</span>
            )}
          </h2>

          {change && (
            <p className="mt-2 text-sm text-green-400">
              ↑ {change}
            </p>
          )}
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}