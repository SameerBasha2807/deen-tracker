"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function WeeklyAnalytics() {
  const { user } = useAuth();

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user?.uid) {
        if (mounted) {
          setAnalytics(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const data = await getAnalytics(user.uid);

        if (mounted) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error(
          "Failed to load weekly analytics:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    const handleUpdate = () => {
      void load();
    };

    window.addEventListener(
      "prayer-data-updated",
      handleUpdate
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "prayer-data-updated",
        handleUpdate
      );
    };
  }, [user?.uid]);

  const prayerScore =
    analytics?.weeklyScore ?? 0;

  const goalsCompleted =
    analytics?.goals.completedGoals ?? 0;

  const activeGoals =
    analytics?.goals.activeGoals ?? 0;

  return (
    <DashboardCard>
      <SectionHeader
        title="Weekly Analytics"
        subtitle="Your current week's Fard prayer and goal performance."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <StatCard
          icon={CheckCircle2}
          title="Fard Prayer Score"
          value={
            loading
              ? "..."
              : `${prayerScore}%`
          }
        />

        <StatCard
          icon={Target}
          title="Weekly Goals"
          value={
            loading
              ? "..."
              : `${goalsCompleted} / ${activeGoals}`
          }
        />
      </div>
    </DashboardCard>
  );
}