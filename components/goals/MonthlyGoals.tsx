"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";

import {
  getGoalProgress,
  getUserGoals,
} from "@/lib/goals";

import type {
  UserGoal,
  GoalProgress,
} from "@/lib/goals";

export default function MonthlyGoals() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [goals, setGoals] =
    useState<UserGoal[]>([]);

  const [progress, setProgress] =
    useState<
      Record<string, GoalProgress>
    >({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadMonthlyGoals =
    useCallback(async () => {
      if (!user) {
        setGoals([]);
        setProgress({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allGoals =
          await getUserGoals(
            user.uid
          );

        const monthlyGoals =
          allGoals.filter(
            (goal) =>
              goal.active &&
              goal.period === "monthly"
          );

        const progressEntries =
          await Promise.all(
            monthlyGoals.map(
              async (goal) => {
                const result =
                  await getGoalProgress(
                    user.uid,
                    goal
                  );

                return [
                  goal.id,
                  result,
                ] as const;
              }
            )
          );

        setGoals(
          monthlyGoals
        );

        setProgress(
          Object.fromEntries(
            progressEntries
          )
        );
      } catch (error) {
        console.error(
          "Could not load monthly goals:",
          error
        );

        setError(
          "Could not load your monthly goals."
        );
      } finally {
        setLoading(false);
      }
    }, [user]);

  /*
   * INITIAL LOAD
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadMonthlyGoals();
  }, [
    authLoading,
    loadMonthlyGoals,
  ]);

  /*
   * REFRESH AFTER GOAL UPDATE
   */

  useEffect(() => {
    function handleGoalsUpdate() {
      void loadMonthlyGoals();
    }

    window.addEventListener(
      "goals-data-updated",
      handleGoalsUpdate
    );

    window.addEventListener(
      "prayer-data-updated",
      handleGoalsUpdate
    );

    window.addEventListener(
      "quran-data-updated",
      handleGoalsUpdate
    );

    return () => {
      window.removeEventListener(
        "goals-data-updated",
        handleGoalsUpdate
      );

      window.removeEventListener(
        "prayer-data-updated",
        handleGoalsUpdate
      );

      window.removeEventListener(
        "quran-data-updated",
        handleGoalsUpdate
      );
    };
  }, [loadMonthlyGoals]);

  return (
    <DashboardCard>
      <SectionHeader
        title="Monthly Goals"
        subtitle="Your personal goals for this month."
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
              No monthly goals yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Create a monthly goal to start tracking
              your progress.
            </p>
          </div>
        ) : null}

        {/* Monthly goals */}

        {!loading &&
        !error &&
        goals.length > 0
          ? goals.map((goal) => {
              const goalProgress =
                progress[goal.id];

              const currentProgress =
                goalProgress?.progress ?? 0;

              const percentage =
                goalProgress?.percentage ?? 0;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-[#172235] bg-[#081522] p-5"
                >
                  <ProgressBar
                    label={goal.title}
                    value={percentage}
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>
                      Target: {goal.target}{" "}
                      {goal.unit}
                    </span>

                    <span>
                      {currentProgress} /{" "}
                      {goal.target}
                    </span>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </DashboardCard>
  );
}