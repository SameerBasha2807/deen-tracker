"use client";

import {
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";

import {
  getUserGoalStats,
  type GoalStats,
} from "@/lib/goals";

import { auth } from "@/lib/firebase";

export default function GoalProgress() {
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
    <DashboardCard>
      <SectionHeader
        title="Goal Progress"
        subtitle="A quick overview of your current goals."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Completed */}
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={
            loading
              ? "..."
              : String(
                  stats.completedGoals
                )
          }
        />

        {/* Active Goals */}
        <StatCard
          icon={Target}
          title="Active Goals"
          value={
            loading
              ? "..."
              : String(
                  stats.activeGoals
                )
          }
        />

        {/* Success Rate */}
        <StatCard
          icon={TrendingUp}
          title="Success Rate"
          value={
            loading
              ? "..."
              : `${stats.successRate}%`
          }
        />
      </div>
    </DashboardCard>
  );
}