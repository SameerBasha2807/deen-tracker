import { CheckCircle2 } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const completed = [
  "Completed Fajr Prayer",
  "Read 5 Quran Pages",
  "Morning Dhikr",
  "Read One Hadith",
  "Exercise 30 Minutes",
];

export default function CompletedGoals() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Completed Goals"
        subtitle="Goals you've successfully completed."
      />

      <div className="mt-8 space-y-4">
        {completed.map((goal) => (
          <div
            key={goal}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-500 hover:shadow-md"
          >
            <CheckCircle2
              className="text-emerald-600"
              size={22}
            />

            <span className="font-medium">
              {goal}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}