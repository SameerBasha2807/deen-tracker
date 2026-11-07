import { CalendarDays, Flame } from "lucide-react";

export default function GreetingCard() {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white shadow-xl">
      <p className="text-sm opacity-90">
        Assalamu Alaikum 👋
      </p>

      <h1 className="mt-2 text-4xl font-bold">
        Welcome Back, Sameer
      </h1>

      <p className="mt-4 max-w-xl text-emerald-100">
        Stay consistent today. Every prayer, every page of Quran,
        every act of worship counts.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
          <Flame size={18} />
          <span>27 Day Streak</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
          <CalendarDays size={18} />
          <span>12 Safar 1448 AH</span>
        </div>
      </div>
    </div>
  );
}