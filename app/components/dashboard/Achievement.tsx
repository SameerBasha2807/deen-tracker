import { Trophy } from "lucide-react";

export default function Achievement() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-amber-500" />

        <div>
          <h2 className="text-xl font-bold">
            Achievement
          </h2>

          <p className="text-sm text-slate-500">
            Keep growing
          </p>
        </div>
      </div>

      <h3 className="mt-8 text-2xl font-bold">
        🔥 30 Day Prayer Streak
      </h3>

      <p className="mt-3 text-slate-500">
        You're building excellent consistency.
      </p>
    </div>
  );
}