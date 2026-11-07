
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getGoalProgress,
  getUserGoals,
  updateManualGoalProgress,
  type UserGoal,
  type GoalProgress,
} from "@/lib/goals";

import type { GoalPeriod } from "@/lib/types";

import GoalActions from "@/app/components/goals/GoalActions";

interface PeriodGoalsListProps {
  period: "weekly" | "monthly";
  title: string;
  subtitle: string;
}

export default function PeriodGoalsList({
  period,
  title,
  subtitle,
}: PeriodGoalsListProps) {
  const { user, loading: authLoading } = useAuth();

  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [progress, setProgress] =
    useState<Record<string, GoalProgress>>({});

  const [loading, setLoading] = useState(true);
  const [updatingGoalId, setUpdatingGoalId] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setProgress({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allGoals = await getUserGoals(user.uid);

      const filteredGoals = allGoals.filter(
        (goal) => goal.active && goal.period === period
      );

      const progressEntries = await Promise.all(
        filteredGoals.map(async (goal) => {
          const result = await getGoalProgress(user.uid, goal);

          return [goal.id, result] as const;
        })
      );

      setGoals(filteredGoals);
      setProgress(Object.fromEntries(progressEntries));
    } catch (error) {
      console.error(`Could not load ${period} goals:`, error);
      setError(`Could not load your ${period} goals.`);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    if (authLoading) return;

    void loadGoals();
  }, [authLoading, loadGoals]);

  useEffect(() => {
    const refresh = () => {
      void loadGoals();
    };

    window.addEventListener("goals-data-updated", refresh);
    window.addEventListener("goal-data-updated", refresh);
    window.addEventListener("prayer-data-updated", refresh);
    window.addEventListener("quran-data-updated", refresh);

    return () => {
      window.removeEventListener("goals-data-updated", refresh);
      window.removeEventListener("goal-data-updated", refresh);
      window.removeEventListener("prayer-data-updated", refresh);
      window.removeEventListener("quran-data-updated", refresh);
    };
  }, [loadGoals]);

  async function changeManualProgress(
    goal: UserGoal,
    amount: number
  ) {
    if (!user || updatingGoalId) return;

    const current = progress[goal.id]?.progress ?? 0;

    const next = Math.max(
      0,
      Math.min(current + amount, goal.target)
    );

    if (next === current) return;

    const percentage =
      goal.target > 0
        ? Math.round((next / goal.target) * 100)
        : 0;

    setProgress((previous) => ({
      ...previous,
      [goal.id]: {
        goalId: goal.id,
        progress: next,
        target: goal.target,
        percentage,
        completed: next >= goal.target,
      },
    }));

    try {
      setUpdatingGoalId(goal.id);
      setError(null);

      await updateManualGoalProgress(user.uid, goal, next);

      window.dispatchEvent(new Event("goals-data-updated"));
    } catch (error) {
      console.error("Could not update goal progress:", error);
      setError("Could not update progress. Please try again.");
      await loadGoals();
    } finally {
      setUpdatingGoalId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin text-emerald-400" />
          Loading {period} goals...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 text-center text-slate-400">
        Sign in to view your goals.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {subtitle}
          </p>
        </div>

        <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
          {goals.length} active goals
        </span>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </p>
      )}

      {goals.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#26364B] bg-[#081522] p-8 text-center">
          <Circle size={30} className="mx-auto text-slate-500" />

          <h3 className="mt-3 font-semibold text-white">
            No {period} goals yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Create a goal and select {period} as its period.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {goals.map((goal) => {
            const itemProgress = progress[goal.id];
            const current = itemProgress?.progress ?? 0;
            const percentage = itemProgress?.percentage ?? 0;
            const completed = itemProgress?.completed ?? false;
            const isManual = goal.trackingMode === "manual";
            const updating = updatingGoalId === goal.id;

            return (
              <article
                key={goal.id}
                className="rounded-2xl border border-[#26364B] bg-[#081522] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      {completed ? (
                        <CheckCircle2
                          className="mt-0.5 shrink-0 text-emerald-400"
                          size={22}
                        />
                      ) : (
                        <Circle
                          className="mt-0.5 shrink-0 text-slate-500"
                          size={22}
                        />
                      )}

                      <div className="min-w-0">
                        <h3 className="font-semibold text-white">
                          {goal.title}
                        </h3>

                        {goal.description && (
                          <p className="mt-1 text-sm text-slate-400">
                            {goal.description}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-500">
                          {goal.category} · {goal.trackingMode} tracking
                        </p>
                      </div>
                    </div>

                    <GoalActions goal={goal} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-400">
                        Progress
                      </span>

                      <span className="font-semibold text-white">
                        {current} / {goal.target} {goal.unit}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#172235]">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-right text-xs text-emerald-300">
                      {percentage}% completed
                    </p>
                  </div>

                  {isManual && (
                    <div className="flex items-center justify-between border-t border-[#26364B] pt-4">
                      <span className="text-xs text-slate-400">
                        Update your progress
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            void changeManualProgress(goal, -1)
                          }
                          disabled={updating || current <= 0}
                          aria-label={`Decrease ${goal.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#34445C] text-slate-300 hover:border-rose-400 hover:text-rose-300 disabled:opacity-40"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-8 text-center text-sm font-semibold text-white">
                          {updating ? "..." : current}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void changeManualProgress(goal, 1)
                          }
                          disabled={
                            updating || current >= goal.target
                          }
                          aria-label={`Increase ${goal.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
