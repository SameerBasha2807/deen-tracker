import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "text-emerald-400",
}: Props) {
  return (
    <div className="rounded-3xl border border-[#172235] bg-[#0A1624] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl">
      <div className={`${color} mb-5`}>
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {value}
      </h3>
    </div>
  );
}