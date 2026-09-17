"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Target } from "lucide-react";

import PageHero from "@/components/ui/PageHero";

import {
  getUserGoalStats,
  type GoalStats,
} from "@/lib/goals";

import { auth } from "@/lib/firebase";

export default function GoalsHero() {
  const [stats, setStats] = useState<GoalStats>({
    activeGoals: 0,
    completedGoals: 0,
    successRate: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          if (mounted) {
            setStats({
              activeGoals: 0,
              completedGoals: 0,
              successRate: 0,
            });

            setLoading(false);
          }

          return;
        }

        try {
          setLoading(true);

          const result =
            await getUserGoalStats(user.uid);

          if (mounted) {
            setStats(result);
          }
        } catch (error) {
          console.error(
            "Failed to load goal statistics:",
            error
          );

          if (mounted) {
            setStats({
              activeGoals: 0,
              completedGoals: 0,
              successRate: 0,
            });
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <PageHero
      icon={Target}
      title="Goals Dashboard"
      subtitle="Build lasting Islamic habits by tracking your daily, weekly, and monthly goals."
      stats={[
        {
          label: "Completed",
          value: loading
            ? "..."
            : String(
                stats.completedGoals
              ),
        },
        {
          label: "Active Goals",
          value: loading
            ? "..."
            : String(
                stats.activeGoals
              ),
        },
        {
          label: "Success",
          value: loading
            ? "..."
            : `${stats.successRate}%`,
        },
      ]}
    />
  );
}