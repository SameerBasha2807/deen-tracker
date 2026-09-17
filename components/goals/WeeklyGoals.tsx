"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";
import { getUserGoals } from "@/lib/goals";

import type { UserGoal } from "@/lib/types";

export default function WeeklyGoals() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [goals, setGoals] =
    useState<UserGoal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadWeeklyGoals =
    useCallback(async () => {
      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allGoals =
          await getUserGoals(user.uid);

        const weeklyGoals =
          allGoals.filter(
            (goal) =>
              goal.active &&
              goal.period === "weekly"
          );

        setGoals(weeklyGoals);
      } catch (error) {
        console.error(
          "Could not load weekly goals:",
          error
        );

        setError(
          "Could not load your weekly goals."
        );
      } finally {
        setLoading(false);
      }
    }, [user]);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadWeeklyGoals();
  }, [
    authLoading,
    loadWeeklyGoals,
  ]);

  /* =====================================================
     REFRESH AFTER GOAL CREATION / UPDATE
  ===================================================== */

  useEffect(() => {
    function handleGoalsUpdate() {
      void loadWeeklyGoals();
    }

    window.addEventListener(
      "goals-data-updated",
      handleGoalsUpdate
    );

    return () => {
      window.removeEventListener(
        "goals-data-updated",
        handleGoalsUpdate
      );
    };
  }, [loadWeeklyGoals]);

  return (
    <DashboardCard>
      <SectionHeader
        title="Weekly Goals"
        subtitle="Your personal goals for this week."
      />

      <div className="mt-8 space-y-7">

        {/* Loading */}

        {authLoading || loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-[#172235] bg-[#081522] p-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : null}

        {/* Error */}

        {!loading && error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {/* No goals */}

        {!loading &&
        !error &&
        goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#172235] bg-[#081522] p-8 text-center">
            <p className="font-medium text-white">
              No weekly goals yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Create a weekly goal to start tracking
              your progress.
            </p>
          </div>
        ) : null}

        {/* Weekly goals */}

        {!loading &&
        !error &&
        goals.length > 0
          ? goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-2xl border border-[#172235] bg-[#081522] p-5"
              >
                <ProgressBar
                  label={goal.title}
                  value={0}
                />

                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>
                    Target: {goal.target}{" "}
                    {goal.unit}
                  </span>

                  <span>
                    0 / {goal.target}
                  </span>
                </div>
              </div>
            ))
          : null}
      </div>
    </DashboardCard>
  );
}