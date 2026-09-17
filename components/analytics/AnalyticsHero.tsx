"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

import PageHero from "@/components/ui/PageHero";
import { getAnalytics, type AnalyticsData } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsHero() {
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
          "Failed to load analytics hero:",
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

  const score = analytics?.weeklyScore ?? 0;
  const streak = analytics?.currentStreak ?? 0;
  const growth = analytics?.growth ?? 0;

  return (
    <PageHero
      icon={BarChart3}
      title="Analytics Dashboard"
      subtitle="Understand your worship patterns and stay consistent every day."
      stats={[
        {
          label: "Score",
          value: loading ? "..." : `${score}%`,
        },
        {
          label: "Streak",
          value: loading ? "..." : `${streak}`,
        },
        {
          label: "Growth",
          value: loading
            ? "..."
            : growth > 0
            ? `+${growth}%`
            : `${growth}%`,
        },
      ]}
    />
  );
}