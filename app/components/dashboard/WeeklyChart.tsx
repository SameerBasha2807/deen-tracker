import { TrendingUp } from "lucide-react";

const bars = [65, 90, 50, 82, 98, 70, 95];

export default function WeeklyChart() {
  return (
    <div className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 shadow-lg">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Weekly Progress
          </h3>

          <p className="mt-1 text-slate-400">
            Your consistency this week
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          +12%
        </div>
      </div>

      <div className="flex h-56 items-end justify-between gap-4">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center"
          >
            <div
              className="w-full rounded-t-3xl bg-gradient-to-t from-emerald-600 to-emerald-300 transition-all duration-500 hover:scale-105"
              style={{
                height: `${height}%`,
              }}
            />

            <span className="mt-3 text-sm text-slate-400">
              {["M", "T", "W", "T", "F", "S", "S"][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}