interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "red" | "blue" | "default";
}

export default function MetricCard({ label, value, sub, highlight = "default" }: MetricCardProps) {
  const colors: Record<string, string> = {
    green:   "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
    red:     "border-rose-500/40   bg-rose-950/40   text-rose-300",
    blue:    "border-blue-500/40   bg-blue-950/40   text-blue-300",
    default: "border-gray-700/60   bg-gray-900/60   text-gray-100",
  };
  return (
    <div className={"rounded-xl border px-5 py-4 " + colors[highlight]}>
      <p className="text-xs font-medium uppercase tracking-widest opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-50">{sub}</p>}
    </div>
  );
}
