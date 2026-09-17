import { Bell, UserCircle2 } from "lucide-react";

export default function WindowHeader() {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-slate-700 pb-8">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* macOS dots */}
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            DeenTracker Dashboard
          </h3>

          <p className="text-sm text-slate-400">
            Track your daily worship
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button className="rounded-2xl border border-slate-700 bg-[#111827] p-3 text-slate-300 transition hover:border-emerald-500 hover:text-white">
          <Bell size={20} />
        </button>

        <button className="rounded-full border border-slate-700 bg-[#111827] p-2 text-slate-300 transition hover:border-emerald-500 hover:text-white">
          <UserCircle2 size={32} />
        </button>

      </div>
    </div>
  );
}