
"use client";

import PeriodGoalsList from "@/app/components/goals/PeriodGoalsList";

export default function WeeklyGoals() {
  return (
    <PeriodGoalsList
      period="weekly"
      title="Weekly Goals"
      subtitle="Your personal goals for this week."
    />
  );
}
