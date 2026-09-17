"use client";

import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";

import {
  getAnalytics,
  type AnalyticsData,
} from "@/lib/analytics";

import { useAuth } from "@/contexts/AuthContext";

export default function PrayerVsQuran() {
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
          "Failed to load prayer vs Quran analytics:",
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
    };
  }, [user?.uid]);

  /*
   * Prayer score comes from the current
   * week's Fard prayer calculation.
   */
  const prayerScore =
    analytics?.weeklyScore ?? 0;

  /*
   * Quran score is currently taken from
   * AnalyticsData if available.
   *
   * If the analytics service does not
   * currently provide a Quran score,
   * it safely displays 0 instead of
   * using fake/hardcoded data.
   */
const quranScore =
  analytics?.quranConsistency ?? 0;
  return (
    <DashboardCard>
      <SectionHeader
        title="Prayer vs Quran"
        subtitle="Compare your progress across two key worship habits."
      />

      <div className="mt-8 space-y-8">
        <ProgressBar
          label="Prayer Consistency"
          value={
            loading
              ? 0
              : prayerScore
          }
        />

        <ProgressBar
          label="Quran Reading"
          value={
            loading
              ? 0
              : quranScore
          }
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-emerald-500/10 p-6">
          <p className="text-sm text-slate-400">
            Fard Prayer
          </p>

          <h2 className="mt-2 text-4xl font-bold text-emerald-400">
            {loading
              ? "..."
              : `${Math.round(
                  prayerScore
                )}%`}
          </h2>
        </div>

        <div className="rounded-2xl bg-blue-500/10 p-6">
          <p className="text-sm text-slate-400">
            Quran
          </p>

          <h2 className="mt-2 text-4xl font-bold text-blue-400">
            {loading
              ? "..."
              : `${Math.round(
                  quranScore
                )}%`}
          </h2>
        </div>
      </div>
    </DashboardCard>
  );
}