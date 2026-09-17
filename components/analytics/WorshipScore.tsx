"use client";

import {
  Award,
  Target,
  TrendingUp,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function WorshipScore() {
  const { user, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!user?.uid) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getAnalytics(user.uid);

      setAnalytics(data);
    } catch (error) {
      console.error(
        "Failed to load worship analytics:",
        error
      );

      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  /*
   * Initial load
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadAnalytics();
  }, [
    authLoading,
    loadAnalytics,
  ]);

  /*
   * Refresh whenever prayer or goal
   * data changes elsewhere in the app.
   */
  useEffect(() => {
    function handlePrayerUpdate() {
      void loadAnalytics();
    }

    function handleGoalsUpdate() {
      void loadAnalytics();
    }

    window.addEventListener(
      "prayer-data-updated",
      handlePrayerUpdate
    );

    window.addEventListener(
      "goals-data-updated",
      handleGoalsUpdate
    );

    return () => {
      window.removeEventListener(
        "prayer-data-updated",
        handlePrayerUpdate
      );

      window.removeEventListener(
        "goals-data-updated",
        handleGoalsUpdate
      );
    };
  }, [loadAnalytics]);

  /*
   * ================================
   * USER-SPECIFIC ANALYTICS
   * ================================
   */

  const score =
    analytics?.weeklyScore ?? 0;

  const goalsCompleted =
    analytics?.goals?.completedGoals ?? 0;

  const activeGoals =
    analytics?.goals?.activeGoals ?? 0;

  const growth =
    analytics?.growth ?? 0;

  return (
    <DashboardCard>
      <SectionHeader
        title="Overall Performance"
        subtitle="Your Fard prayer and goal performance for the current week."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* ================================
            WEEKLY WORSHIP SCORE
            Fard prayers only
        ================================= */}

        <StatCard
          icon={Award}
          title="Weekly Worship Score"
          value={
            loading
              ? "..."
              : `${score}%`
          }
        />

        {/* ================================
            WEEKLY GOALS
        ================================= */}

        <StatCard
          icon={Target}
          title="Weekly Goals"
          value={
            loading
              ? "..."
              : `${goalsCompleted} / ${activeGoals}`
          }
        />

        {/* ================================
            WEEKLY GROWTH

            Week 1:
              0%

            Week 2:
              0%

            Week 3+:
              Previous completed week
              comparison
        ================================= */}

        <StatCard
          icon={TrendingUp}
          title="Weekly Growth"
          value={
            loading
              ? "..."
              : growth > 0
              ? `+${growth}%`
              : `${growth}%`
          }
        />
      </div>
    </DashboardCard>
  );
}