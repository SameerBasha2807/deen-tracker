import { Flame, Clock3, Target } from "lucide-react";

export default function PrayerHero() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div>
          <p className="text-sm text-emerald-100">
            Monday • 3 August 2026
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Prayer Dashboard
          </h1>

          <p className="mt-4 max-w-xl text-emerald-100">
            Stay consistent with your five daily prayers and build a
            stronger connection with Allah.
          </p>
        </div>

        {/* Right Stats */}
        <div className="grid grid-cols-3 gap-4">

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg">
            <Target className="mb-2 h-6 w-6" />
            <h2 className="text-3xl font-bold">3/5</h2>
            <p className="text-sm text-emerald-100">
              Completed
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg">
            <Flame className="mb-2 h-6 w-6 text-orange-300" />
            <h2 className="text-3xl font-bold">18</h2>
            <p className="text-sm text-emerald-100">
              Day Streak
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg">
            <Clock3 className="mb-2 h-6 w-6" />
            <h2 className="text-3xl font-bold">2h</h2>
            <p className="text-sm text-emerald-100">
              Until Asr
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}