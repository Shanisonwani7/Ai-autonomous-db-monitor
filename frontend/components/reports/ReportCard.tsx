interface ReportCardProps {
  title: string;
  value: string;
  color?: string;
}

export default function ReportCard({
  title,
  value,
  color = "text-white",
}: ReportCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300">

      <h3 className="text-sm text-slate-400 mb-2">
        {title}
      </h3>

      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>

    </div>
  );
}