"use client";

import { Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function Insights() {
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
          "Failed to load insights:",
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

    window.addEventListener(
      "quran-data-updated",
      handleUpdate
    );

    window.addEventListener(
      "goal-data-updated",
      handleUpdate
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "prayer-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "quran-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "goal-data-updated",
        handleUpdate
      );
    };
  }, [user?.uid]);

  const score =
    analytics?.weeklyScore ?? 0;

  const streak =
    analytics?.currentStreak ?? 0;

  const growth =
    analytics?.growth ?? 0;

  const goalsCompleted =
    analytics?.goals.completedGoals ?? 0;

  const activeGoals =
    analytics?.goals.activeGoals ?? 0;

const quranScore =
  analytics?.quranConsistency ?? 0;

  const insights: string[] = [];

  if (loading) {
    insights.push(
      "Analyzing your recent worship activity..."
    );
  } else {
    if (score >= 90) {
      insights.push(
        `Excellent Fard prayer consistency this week at ${Math.round(
          score
        )}%.`
      );
    } else if (score >= 70) {
      insights.push(
        `Your Fard prayer consistency is ${Math.round(
          score
        )}% this week. Keep building consistency.`
      );
    } else if (score > 0) {
      insights.push(
        `Your Fard prayer score is ${Math.round(
          score
        )}% this week. Try to improve your consistency day by day.`
      );
    } else {
      insights.push(
        "No Fard prayer activity has been recorded for this week yet."
      );
    }

    if (streak > 0) {
      insights.push(
        `You currently have a ${streak}-day Fard prayer streak.`
      );
    } else {
      insights.push(
        "Start building your Fard prayer streak by completing all five prayers today."
      );
    }

    if (growth > 0) {
      insights.push(
        `Your Fard prayer performance improved by ${growth}% compared with the previous completed week.`
      );
    } else if (growth < 0) {
      insights.push(
        `Your Fard prayer performance decreased by ${Math.abs(
          growth
        )}% compared with the previous completed week.`
      );
    } else {
      insights.push(
        "Weekly growth will appear after you have a completed previous week to compare against."
      );
    }

    if (activeGoals > 0) {
      insights.push(
        `You have completed ${goalsCompleted} of ${activeGoals} active goals this week.`
      );
    } else {
      insights.push(
        "You currently have no active goals."
      );
    }

    if (quranScore > 0) {
      insights.push(
        `Your Quran activity score for the current week is ${Math.round(
          quranScore
        )}%.`
      );
    }
  }

  return (
    <DashboardCard>
      <SectionHeader
        title="AI Insights"
        subtitle="Small observations from your recent worship activity."
      />

      <div className="mt-8 space-y-4">
        {insights.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-start gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5 transition hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-md"
          >
            <div className="shrink-0 rounded-xl bg-emerald-500/10 p-3">
              <Lightbulb
                size={20}
                className="text-emerald-400"
              />
            </div>

            <p className="leading-7 text-slate-300">
              {item}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}