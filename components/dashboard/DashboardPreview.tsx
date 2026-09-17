import {
  BookOpen,
  CalendarDays,
  Clock3,
  Flame,
  MoonStar,
  Target,
} from "lucide-react";

import ProgressRing from "./ProgressRing";
import StatCard from "./StatCard";
import WeeklyChart from "./WeeklyChart";
import WindowHeader from "./WindowHeader";

export default function DashboardPreview() {
  return (
    <section
      id="dashboard"
      className="relative overflow-hidden bg-slate-950 py-28"
    >
      {/* Background Effects */}

      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[160px]" />

        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />

        <div
          className="
            absolute
            inset-0
            opacity-[0.03]
            [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mb-20 text-center">
          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
            Dashboard Preview
          </span>

          <h2 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-6xl">
            Your Entire Deen.
            <br />
            One Beautiful Dashboard.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Track prayers, Quran, dhikr, charity, goals and spiritual
            consistency from one elegant dashboard designed for focus and
            productivity.
          </p>
        </div>

        {/* Dashboard Window */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-white/10
            bg-slate-900/70
            p-8
            shadow-[0_30px_80px_rgba(0,0,0,0.45)]
            backdrop-blur-3xl
          "
        >
          {/* Decorative Glow */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

          {/* Window Header */}

          <div className="relative z-10">
            <WindowHeader />
          </div>

          {/* Top Row */}

          <div className="relative z-10 mt-8 grid gap-8 lg:grid-cols-2">
            {/* Progress */}

            <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-8 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">
                Today's Progress
              </h3>

              <div className="mt-10 flex items-center gap-8">
                <ProgressRing value={82} />

                <div>
                  <h2 className="text-5xl font-bold text-white">
                    82%
                  </h2>

                  <p className="mt-3 text-slate-400">
                    You're on track. Keep your momentum going.
                  </p>
                </div>
              </div>
            </div>

            {/* Weekly Chart */}

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl">
              <WeeklyChart />
            </div>
          </div>

          {/* Stat Cards */}

          <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Prayer"
              value="4 / 5"
              icon={<MoonStar />}
            />

            <StatCard
              title="Quran"
              value="18 Pages"
              icon={<BookOpen />}
            />

            <StatCard
              title="Goals"
              value="8 / 10"
              icon={<Target />}
              color="text-amber-500"
            />

            <StatCard
              title="Streak"
              value="27 Days"
              icon={<Flame />}
              color="text-orange-500"
            />
          </div>

          {/* Bottom Row */}

          <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-sky-400" />

                <h3 className="font-semibold text-white">
                  Hijri Date
                </h3>
              </div>

              <h2 className="mt-6 text-3xl font-bold text-white">
                12 Safar 1448 AH
              </h2>

              <p className="mt-2 text-slate-400">
                Wednesday
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Clock3 className="text-violet-400" />

                <h3 className="font-semibold text-white">
                  Next Prayer
                </h3>
              </div>

              <h2 className="mt-6 text-3xl font-bold text-white">
                Maghrib
              </h2>

              <p className="mt-2 text-slate-400">
                In 1 hour 12 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}