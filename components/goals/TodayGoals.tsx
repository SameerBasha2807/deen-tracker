"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";

import { getUserGoals } from "@/lib/goals";

import type { UserGoal } from "@/lib/types";

export default function TodayGoals() {
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

  const loadTodayGoals =
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

        const todayGoals =
          allGoals.filter(
            (goal) =>
              goal.active &&
              goal.period === "daily"
          );

        setGoals(todayGoals);
      } catch (error) {
        console.error(
          "Could not load today's goals:",
          error
        );

        setError(
          "Could not load your goals."
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

    void loadTodayGoals();
  }, [
    authLoading,
    loadTodayGoals,
  ]);

  /* =====================================================
     REFRESH WHEN A GOAL IS CREATED/UPDATED
  ===================================================== */

  useEffect(() => {
    function handleGoalsUpdate() {
      void loadTodayGoals();
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
  }, [loadTodayGoals]);

  return (
    <DashboardCard>
      <SectionHeader
        title="Today's Goals"
        subtitle="Your personal goals for today."
      />

      <div className="mt-6 space-y-4">
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
              No daily goals yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Create your first daily goal to start
              building consistency.
            </p>
          </div>
        ) : null}

        {/* Goals */}

        {!loading &&
        !error &&
        goals.length > 0
          ? goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between rounded-2xl border border-[#172235] bg-[#081522] p-5 transition hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {/* 
                   * For now these are not marked completed
                   * automatically.
                   *
                   * Automatic progress will be connected
                   * to Prayer/Quran/Dhikr data in the next step.
                   */}

                  <Circle className="h-6 w-6 shrink-0 text-slate-400" />

                  <div className="min-w-0">
                    <span className="block truncate font-medium text-white">
                      {goal.title}
                    </span>

                    <p className="mt-1 text-xs text-slate-500">
                      Target: {goal.target}{" "}
                      {goal.unit}
                    </p>
                  </div>
                </div>

                <span className="ml-4 shrink-0 font-medium text-slate-400">
                  Pending
                </span>
              </div>
            ))
          : null}
      </div>
    </DashboardCard>
  );
}