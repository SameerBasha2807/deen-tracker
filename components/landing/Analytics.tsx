import {
  TrendingUp,
  Flame,
  MoonStar,
  BookOpen,
} from "lucide-react";

import HeroBackground from "./HeroBackground";

export default function Analytics() {
  return (
    <section
      id="analytics"
      className="relative overflow-hidden bg-[#030712] py-28"
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Analytics
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Visualize Your Growth
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Understand your worship through beautiful charts, streaks,
            consistency reports and meaningful insights.
          </p>
        </div>

        {/* Analytics Window */}

        <div className="relative mt-20 overflow-hidden rounded-[36px] border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl">

          {/* Glow */}

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-[140px]" />

          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[140px]" />

          {/* Window Header */}

          <div className="relative mb-8 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[2fr,1fr]">

            {/* Chart */}

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">

              <div className="mb-8 flex items-center gap-3">
                <TrendingUp className="text-emerald-400" />

                <h3 className="text-xl font-semibold text-white">
                  Weekly Worship
                </h3>
              </div>

              <div className="flex h-72 items-end justify-between gap-4">

                {[55, 72, 64, 88, 80, 92, 100].map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400"
                      style={{
                        height: `${value * 2}px`,
                      }}
                    />

                    <span className="mt-3 text-xs text-slate-500">
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][index]}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* Stats */}

            <div className="space-y-6">

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <MoonStar className="text-emerald-400" />

                <h3 className="mt-4 text-3xl font-bold text-white">
                  94%
                </h3>

                <p className="mt-2 text-slate-400">
                  Prayer Consistency
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <BookOpen className="text-sky-400" />

                <h3 className="mt-4 text-3xl font-bold text-white">
                  128
                </h3>

                <p className="mt-2 text-slate-400">
                  Quran Pages
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <Flame className="text-orange-400" />

                <h3 className="mt-4 text-3xl font-bold text-white">
                  27 Days
                </h3>

                <p className="mt-2 text-slate-400">
                  Current Streak
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}