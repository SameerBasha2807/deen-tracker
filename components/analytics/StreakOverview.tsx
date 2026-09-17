"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Calendar,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function StreakOverview() {
  const { user } = useAuth();

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

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

        const data =
          await getAnalytics(user.uid);

        if (mounted) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error(
          "Failed to load streak analytics:",
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

  const currentStreak =
    analytics?.currentStreak ?? 0;

  const bestStreak =
    analytics?.bestStreak ?? 0;

  return (
    <DashboardCard>
      <SectionHeader
        title="Streak Overview"
        subtitle="Your Fard prayer consistency streak."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          icon={Flame}
          title="Current Streak"
          value={
            loading
              ? "..."
              : `${currentStreak} ${
                  currentStreak === 1
                    ? "Day"
                    : "Days"
                }`
          }
        />

        <StatCard
          icon={Calendar}
          title="Best Streak"
          value={
            loading
              ? "..."
              : `${bestStreak} ${
                  bestStreak === 1
                    ? "Day"
                    : "Days"
                }`
          }
        />
      </div>
    </DashboardCard>
  );
}