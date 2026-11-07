
"use client";

import { useState } from "react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";

import GoalsHero from "@/app/components/goals/GoalsHero";
import GoalProgress from "@/app/components/goals/GoalProgress";
import CreateGoal from "@/app/components/goals/CreateGoal";
import DailyGoalTemplate from "@/app/components/goals/DailyGoalTemplate";

import TodayGoals from "@/app/components/goals/TodayGoals";
import WeeklyGoals from "@/app/components/goals/WeeklyGoals";
import MonthlyGoals from "@/app/components/goals/MonthlyGoals";
import GoalCategories from "@/app/components/goals/GoalCategories";

export default function GoalsPage() {
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [goalRefreshKey, setGoalRefreshKey] = useState(0);

  function handleGoalCreated() {
    setGoalRefreshKey((current) => current + 1);

    window.dispatchEvent(new Event("goals-data-updated"));
    window.dispatchEvent(new Event("goal-data-updated"));
  }

  return (
    <main className="flex min-h-screen bg-[#030712]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="space-y-8 p-8">
          <GoalsHero />

          <GoalProgress key={`progress-${goalRefreshKey}`} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCreateGoalOpen(true)}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              + Create Goal
            </button>
          </div>

          <CreateGoal
            open={createGoalOpen}
            onClose={() => setCreateGoalOpen(false)}
            onCreated={handleGoalCreated}
          />

          {/* PERSONAL DAILY GOAL TEMPLATE */}
          <DailyGoalTemplate />

          {/* DAILY AND WEEKLY GOALS */}
          <div className="grid gap-8 xl:grid-cols-2">
            <TodayGoals key={`today-${goalRefreshKey}`} />
            <WeeklyGoals key={`weekly-${goalRefreshKey}`} />
          </div>

          {/* MONTHLY GOALS */}
          <MonthlyGoals key={`monthly-${goalRefreshKey}`} />

          {/* GOAL CATEGORIES */}
          <GoalCategories key={`categories-${goalRefreshKey}`} />
        </div>
      </div>
    </main>
  );
}
