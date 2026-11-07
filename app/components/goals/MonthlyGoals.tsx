
"use client";

import PeriodGoalsList from "@/app/components/goals/PeriodGoalsList";

export default function MonthlyGoals() {
  return (
    <PeriodGoalsList
      period="monthly"
      title="Monthly Goals"
      subtitle="Your personal goals for this month."
    />
  );
}
