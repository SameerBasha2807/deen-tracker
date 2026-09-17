import {
  Users,
  Flame,
  BookOpen,
  MoonStar,
} from "lucide-react";

import HeroBackground from "./HeroBackground";

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Future Users",
    color: "text-sky-400",
  },
  {
    icon: MoonStar,
    value: "5",
    label: "Daily Prayers",
    color: "text-emerald-400",
  },
  {
    icon: BookOpen,
    value: "114",
    label: "Surahs",
    color: "text-violet-400",
  },
  {
    icon: Flame,
    value: "365",
    label: "Consistency Days",
    color: "text-orange-400",
  },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mb-16 text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Community
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Growing Together
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
            Build consistency in worship through meaningful goals,
            progress tracking and daily motivation.
          </p>
        </div>

        {/* Stats */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  rounded-[32px]
                  border
                  border-slate-800
                  bg-slate-900/70
                  p-8
                  text-center
                  backdrop-blur-xl
                  shadow-xl
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:border-emerald-500/40
                  hover:shadow-emerald-500/10
                "
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>

                <h3 className="mt-6 text-5xl font-extrabold text-white">
                  {stat.value}
                </h3>

                <p className="mt-3 text-slate-400">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}