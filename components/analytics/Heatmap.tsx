"use client";

import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function Heatmap() {
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
          "Failed to load heatmap:",
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

  const days = analytics?.monthly ?? [];

  return (
    <DashboardCard>
      <SectionHeader
        title="Monthly Consistency"
        subtitle="Your daily Fard prayer activity over the last 35 days."
      />

      <div className="mt-8 grid grid-cols-7 gap-3">
        {loading
          ? Array.from({ length: 35 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-lg bg-slate-700/40"
                />
              )
            )
          : days.map((day) => {
              const value = Math.max(
                0,
                Math.min(
                  100,
                  Math.round(day.prayerScore)
                )
              );

              let intensity =
                "bg-slate-800";

              if (value >= 100) {
                intensity =
                  "bg-emerald-500";
              } else if (value >= 80) {
                intensity =
                  "bg-emerald-500/80";
              } else if (value >= 60) {
                intensity =
                  "bg-emerald-500/60";
              } else if (value >= 40) {
                intensity =
                  "bg-emerald-500/40";
              } else if (value > 0) {
                intensity =
                  "bg-emerald-500/20";
              }

              return (
                <div
                  key={day.date}
                  title={`${day.date} • ${value}% Fard prayers`}
                  className={`aspect-square rounded-lg ${intensity} border border-slate-700/40 transition hover:scale-105`}
                />
              );
            })}

        {!loading && days.length === 0 && (
          <div className="col-span-7 py-8 text-center text-sm text-slate-500">
            No prayer data available.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 text-xs text-slate-500">
        <span>Less</span>

        <span className="h-3 w-3 rounded-sm bg-slate-800" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500/20" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500/40" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500/60" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500/80" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />

        <span>More</span>
      </div>
    </DashboardCard>
  );
}