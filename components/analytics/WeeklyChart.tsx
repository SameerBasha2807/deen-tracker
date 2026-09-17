"use client";

import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function WeeklyChart() {
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
          "Failed to load weekly chart:",
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

  const data = analytics?.weekly ?? [];

  return (
    <DashboardCard>
      <SectionHeader
        title="Weekly Activity"
        subtitle="Your daily Fard prayer consistency for the current week."
      />

      <div className="mt-8 flex h-64 items-end justify-between gap-3">
        {loading
          ? Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full max-w-12 animate-pulse rounded-t-xl bg-slate-700/50"
                  style={{ height: "20%" }}
                />

                <span className="mt-3 text-xs text-slate-500">
                  -
                </span>
              </div>
            ))
          : data.map((day) => {
              const value = Math.max(
                0,
                Math.min(
                  100,
                  Math.round(day.prayerScore)
                )
              );

              const date = new Date(
                `${day.date}T00:00:00`
              );

              const label =
                date.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                );

              return (
                <div
                  key={day.date}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 text-xs font-medium text-slate-300">
                    {value}%
                  </span>

                  <div className="flex h-full w-full max-w-12 items-end">
                    <div
                      className="w-full rounded-t-xl bg-emerald-500/80 transition-all duration-300 hover:bg-emerald-400"
                      style={{
                        height: `${Math.max(
                          value,
                          4
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="mt-3 text-xs text-slate-500">
                    {label}
                  </span>
                </div>
              );
            })}

        {!loading && data.length === 0 && (
          <div className="flex w-full items-center justify-center text-sm text-slate-500">
            No prayer data available.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}