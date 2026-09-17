import {
  CheckCircle2,
  BookOpen,
  Flame,
  CalendarDays,
} from "lucide-react";

import HeroBackground from "./HeroBackground";

const cards = [
  {
    icon: CheckCircle2,
    title: "Prayer Progress",
    text: "4 of 5 prayers completed today.",
    color: "text-emerald-400",
  },
  {
    icon: BookOpen,
    title: "Quran Reading",
    text: "8 pages completed today.",
    color: "text-emerald-400",
  },
  {
    icon: Flame,
    title: "Current Streak",
    text: "27-day consistency streak.",
    color: "text-orange-400",
  },
  {
    icon: CalendarDays,
    title: "Today's Goals",
    text: "6 of 8 goals completed.",
    color: "text-sky-400",
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Dashboard Preview
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Beautiful Daily Dashboard
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Track your prayers, Quran reading, habits and daily worship
            through one elegant dashboard.
          </p>
        </div>

        {/* Dashboard */}

        <div
          className="
            relative
            mt-20
            overflow-hidden
            rounded-[36px]
            border
            border-slate-700
            bg-[#111827]
            p-8
            shadow-[0_40px_120px_rgba(0,0,0,.55)]
          "
        >
          {/* Glow */}

          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />

          {/* Browser Dots */}

          <div className="relative mb-10 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          {/* Cards */}

          <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    rounded-3xl
                    border
                    border-slate-700
                    bg-[#111827]
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:border-emerald-500/40
                    hover:shadow-xl
                    hover:shadow-emerald-500/10
                  "
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F2937]">
                    <Icon className={`h-7 w-7 ${item.color}`} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}