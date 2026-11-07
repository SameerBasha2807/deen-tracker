import { Target } from "lucide-react";

const goals = [
  { title: "Prayers", value: "5 / 5" },
  { title: "Quran", value: "20 Pages" },
  { title: "Dhikr", value: "100 / 100" },
];

export default function GoalsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-3">
          <Target className="h-6 w-6 text-amber-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Today's Goals</h2>
          <p className="text-sm text-slate-500">
            Stay consistent every day
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.title}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
          >
            <span className="font-medium">{goal.title}</span>
            <span className="font-semibold text-emerald-600">
              {goal.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}