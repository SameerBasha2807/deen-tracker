"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import GoalsHero from "@/components/goals/GoalsHero";
import GoalProgress from "@/components/goals/GoalProgress";
import CreateGoal from "@/components/goals/CreateGoal";
import TodayGoals from "@/components/goals/TodayGoals";
import WeeklyGoals from "@/components/goals/WeeklyGoals";
import MonthlyGoals from "@/components/goals/MonthlyGoals";
import GoalCategories from "@/components/goals/GoalCategories";

export default function GoalsPage() {
  const [createGoalOpen, setCreateGoalOpen] =
    useState(false);

  const [goalRefreshKey, setGoalRefreshKey] =
    useState(0);

  function handleGoalCreated() {
    /*
     * Refresh all goal-related components
     * after a new goal is created.
     */
    setGoalRefreshKey((current) => current + 1);
  }

  return (
    <main className="flex min-h-screen bg-[#030712]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="space-y-8 p-8">

          {/* =====================================================
              GOALS HERO
          ===================================================== */}

          <GoalsHero />

          {/* =====================================================
              OVERALL GOAL PROGRESS
          ===================================================== */}

          <GoalProgress key={`progress-${goalRefreshKey}`} />

          {/* =====================================================
              CREATE GOAL
          ===================================================== */}

          <CreateGoal
            open={createGoalOpen}
            onClose={() =>
              setCreateGoalOpen(false)
            }
            onCreated={handleGoalCreated}
          />

          {/* =====================================================
              CREATE GOAL BUTTON
          ===================================================== */}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setCreateGoalOpen(true)
              }
              className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              + Create Goal
            </button>
          </div>

          {/* =====================================================
              TODAY + WEEKLY GOALS
          ===================================================== */}

          <div className="grid gap-8 xl:grid-cols-2">
            <TodayGoals
              key={`today-${goalRefreshKey}`}
            />

            <WeeklyGoals
              key={`weekly-${goalRefreshKey}`}
            />
          </div>

          {/* =====================================================
              MONTHLY GOALS
          ===================================================== */}

          <MonthlyGoals
            key={`monthly-${goalRefreshKey}`}
          />

          {/* =====================================================
              GOAL CATEGORIES
          ===================================================== */}

          <GoalCategories
            key={`categories-${goalRefreshKey}`}
          />

        </div>
      </div>
    </main>
  );
}