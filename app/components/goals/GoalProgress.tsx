
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Target,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getUserGoalStats,
  type GoalStats,
} from "@/lib/goals";

export default function GoalProgress() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<GoalStats>({
    activeGoals: 0,
    completedGoals: 0,
    successRate: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user) {
      setStats({
        activeGoals: 0,
        completedGoals: 0,
        successRate: 0,
      });

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const result = await getUserGoalStats(user.uid);

      setStats(result);
    } catch (error) {
      console.error("Failed to load goal statistics:", error);

      setStats({
        activeGoals: 0,
        completedGoals: 0,
        successRate: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    void loadStats();

    const refresh = () => {
      void loadStats();
    };

    window.addEventListener("goals-data-updated", refresh);
    window.addEventListener("goal-data-updated", refresh);

    return () => {
      window.removeEventListener("goals-data-updated", refresh);
      window.removeEventListener("goal-data-updated", refresh);
    };
  }, [authLoading, loadStats]);

  const cards = [
    {
      title: "Completed Goals",
      value: stats.completedGoals,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      title: "Active Goals",
      value: stats.activeGoals,
      icon: Target,
      color: "text-sky-400",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "text-amber-400",
    },
  ];

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-5 sm:p-7">
      <div>
        <h2 className="text-xl font-bold text-white">
          Goal Progress
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          A quick overview of your current goals.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-[#26364B] bg-[#081522] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {card.title}
                </span>

                <Icon size={22} className={card.color} />
              </div>

              <div className="mt-4 text-3xl font-bold text-white">
                {authLoading || loading ? (
                  <Loader2
                    size={25}
                    className="animate-spin text-emerald-400"
                  />
                ) : (
                  card.value
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
