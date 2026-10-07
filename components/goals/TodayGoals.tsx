"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";

import {
  getUserGoals,
  updateManualGoalProgress,
  type UserGoal,
} from "@/lib/goals";

import { getDailyPrayerLog } from "@/lib/prayers";

import { fardPrayerNames } from "@/lib/types";

function getTodayDate(): string {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function TodayGoals() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [goals, setGoals] =
    useState<UserGoal[]>([]);

  const [progress, setProgress] =
    useState<Record<string, number>>({});

  const [loading, setLoading] =
    useState(true);

  const [updatingGoalId, setUpdatingGoalId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadTodayGoals =
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
          await getUserGoals(user.uid);

        const todayGoals =
          allGoals.filter(
            (goal) =>
              goal.active &&
              goal.period === "daily"
          );

        setGoals(todayGoals);

        /*
         * Today's date.
         */
        const today =
          getTodayDate();

        /*
         * ==========================================
         * AUTOMATIC PRAYER PROGRESS
         * ==========================================
         */

        const hasAutomaticPrayerGoal =
          todayGoals.some(
            (goal) =>
              goal.trackingMode ===
                "automatic" &&
              goal.trackingType ===
                "prayer"
          );

        let completedPrayers = 0;

        if (hasAutomaticPrayerGoal) {
          const prayerLog =
            await getDailyPrayerLog(
              user.uid,
              today
            );

          completedPrayers =
            fardPrayerNames.filter(
              (prayer) =>
                prayerLog.fard[prayer]
            ).length;
        }

        /*
         * ==========================================
         * BUILD PROGRESS MAP
         * ==========================================
         */

        const nextProgress:
          Record<string, number> = {};

        for (const goal of todayGoals) {
          /*
           * Automatic prayer goal
           */
          if (
            goal.trackingMode ===
              "automatic" &&
            goal.trackingType ===
              "prayer"
          ) {
            nextProgress[goal.id] =
              Math.min(
                completedPrayers,
                goal.target
              );

            continue;
          }

          /*
           * Manual goal
           *
           * Only use stored progress if it
           * belongs to today.
           */
          if (
            goal.trackingMode ===
            "manual"
          ) {
            const isToday =
              goal.manualProgressDate ===
              today;

            nextProgress[goal.id] =
              isToday
                ? Math.min(
                    goal.manualProgress ??
                      0,
                    goal.target
                  )
                : 0;

            continue;
          }

          /*
           * Other automatic tracking types
           * will be implemented later.
           */
          nextProgress[goal.id] = 0;
        }

        setProgress(nextProgress);
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

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadTodayGoals();
  }, [
    authLoading,
    loadTodayGoals,
  ]);

  /*
   * ==========================================
   * REFRESH WHEN GOALS CHANGE
   * ==========================================
   */

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

  /*
   * ==========================================
   * REFRESH WHEN PRAYER DATA CHANGES
   * ==========================================
   */

  useEffect(() => {
    function handlePrayerUpdate() {
      void loadTodayGoals();
    }

    window.addEventListener(
      "prayer-data-updated",
      handlePrayerUpdate
    );

    return () => {
      window.removeEventListener(
        "prayer-data-updated",
        handlePrayerUpdate
      );
    };
  }, [loadTodayGoals]);

  /*
   * ==========================================
   * MANUAL PROGRESS
   * ==========================================
   */

  async function changeManualProgress(
    goal: UserGoal,
    amount: number
  ) {
    if (!user) {
      return;
    }

    const current =
      progress[goal.id] ?? 0;

    const next = Math.max(
      0,
      Math.min(
        current + amount,
        goal.target
      )
    );

    if (next === current) {
      return;
    }

    try {
      setUpdatingGoalId(
        goal.id
      );

      setError(null);

      /*
       * Optimistic UI update.
       */
      setProgress(
        (previous) => ({
          ...previous,
          [goal.id]: next,
        })
      );

      await updateManualGoalProgress(
        user.uid,
        goal,
        next
      );

      /*
       * Tell other goal components
       * that the data changed.
       */
      window.dispatchEvent(
        new Event(
          "goals-data-updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not update manual goal:",
        error
      );

      setError(
        "Could not update goal progress."
      );

      /*
       * Reload the actual Firestore value
       * if the write failed.
       */
      await loadTodayGoals();
    } finally {
      setUpdatingGoalId(null);
    }
  }

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
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
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
          ? goals.map((goal) => {
              const current =
                progress[goal.id] ?? 0;

              const completed =
                current >= goal.target;

              const isAutomatic =
                goal.trackingMode ===
                "automatic";

              const isManual =
                goal.trackingMode ===
                "manual";

              const updating =
                updatingGoalId ===
                goal.id;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-[#172235] bg-[#081522] p-5 transition hover:border-emerald-500/40 hover:bg-[#0A1928]"
                >
                  <div className="flex items-center justify-between gap-4">

                    {/* Left side */}

                    <div className="flex min-w-0 items-center gap-4">

                      {completed ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 shrink-0 text-slate-400" />
                      )}

                      <div className="min-w-0">
                        <span className="block truncate font-medium text-white">
                          {goal.title}
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          {current} / {goal.target}{" "}
                          {goal.unit}
                        </p>
                      </div>
                    </div>

                    {/* Right side */}

                    <div className="flex shrink-0 items-center gap-3">

                      {/* Manual controls */}

                      {isManual &&
                      !completed ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void changeManualProgress(
                                goal,
                                -1
                              )
                            }
                            disabled={
                              updating ||
                              current <= 0
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#26364B] bg-[#0A1624] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Decrease ${goal.title} progress`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="min-w-8 text-center text-sm font-medium text-white">
                            {updating
                              ? "..."
                              : current}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void changeManualProgress(
                                goal,
                                1
                              )
                            }
                            disabled={
                              updating ||
                              current >=
                                goal.target
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase ${goal.title} progress`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}

                      {/* Status */}

                      <span
                        className={
                          completed
                            ? "font-medium text-emerald-400"
                            : "font-medium text-slate-400"
                        }
                      >
                        {completed
                          ? "Completed"
                          : isAutomatic
                            ? `${current} / ${goal.target}`
                            : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Manual progress bar */}

                  {isManual ? (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-[#172235]">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${
                              goal.target > 0
                                ? Math.min(
                                    100,
                                    (current /
                                      goal.target) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          : null}
      </div>
    </DashboardCard>
  );
}