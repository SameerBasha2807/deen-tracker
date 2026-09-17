import { LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value: string;
};

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  stats: Stat[];
};

export default function PageHero({
  icon: Icon,
  title,
  subtitle,
  stats,
}: Props) {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-10 text-white shadow-lg">
      <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
        <div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Icon size={34} />
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            {title}
          </h1>

          <p className="mt-3 max-w-2xl text-emerald-100">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm"
            >
              <p className="text-sm text-emerald-100">
                {stat.label}
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}