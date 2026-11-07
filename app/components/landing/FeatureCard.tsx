import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div
      className="
        group
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900/70
        p-8
        backdrop-blur-xl
        shadow-xl
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-emerald-500/40
        hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)]
      "
    >
      {/* Icon */}

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-emerald-400 transition-colors duration-300 group-hover:bg-emerald-500/10">
        {icon}
      </div>

      {/* Title */}

      <h3 className="mb-4 text-2xl font-bold text-white">
        {title}
      </h3>

      {/* Description */}

      <p className="leading-8 text-slate-400">
        {description}
      </p>
    </div>
  );
}