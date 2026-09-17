"use client";

import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import ProgressBar from "@/components/ui/ProgressBar";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyPrayerLog,
} from "@/lib/prayers";

import {
  getDailyQuranLog,
} from "@/lib/quran";

import {
  fardPrayerNames,
} from "@/lib/types";

function localDateFromOffset(
  offset: number
) {
  const date = new Date();

  date.setDate(
    date.getDate() - offset
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

interface Summary {
  prayer: number;
  quran: number;
  overall: number;
}

export default function WeeklySummary() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [summary, setSummary] =
    useState<Summary>({
      prayer: 0,
      quran: 0,
      overall: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setSummary({
        prayer: 0,
        quran: 0,
        overall: 0,
      });

      setLoading(false);
      return;
    }

    let active = true;

   async function loadWeeklySummary() {
  if (!user) {
    return;
  }

  try {
        setLoading(true);

        /*
         * Get the last 7 days.
         */
        const dates = Array.from(
          { length: 7 },
          (_, index) =>
            localDateFromOffset(index)
        );

        /*
         * Load prayer + Quran data
         * for all 7 days.
         */
        const results =
          await Promise.all(
            dates.map(async (date) => {
              const [
                prayerLog,
                quranLog,
              ] = await Promise.all([
                getDailyPrayerLog(
                  user.uid,
                  date
                ),

                getDailyQuranLog(
                  user.uid,
                  date
                ),
              ]);

              return {
                prayerLog,
                quranLog,
              };
            })
          );

        if (!active) {
          return;
        }

        /*
         * ==============================
         * PRAYER %
         * ==============================
         *
         * 5 Fard prayers × 7 days
         * = 35 possible prayers.
         */
        let completedFard = 0;

        for (const result of results) {
          completedFard +=
            fardPrayerNames.filter(
              (prayer) =>
                result.prayerLog.fard[
                  prayer
                ]
            ).length;
        }

        const totalPossibleFard =
          fardPrayerNames.length * 7;

        const prayerPercentage =
          totalPossibleFard > 0
            ? Math.round(
                (completedFard /
                  totalPossibleFard) *
                  100
              )
            : 0;

        /*
         * ==============================
         * QURAN %
         * ==============================
         *
         * A Quran-active day means
         * the user read at least 1 page.
         */
        const quranActiveDays =
          results.filter(
            (result) =>
              result.quranLog.pagesRead >
              0
          ).length;

        const quranPercentage =
          Math.round(
            (quranActiveDays / 7) *
              100
          );

        /*
         * ==============================
         * OVERALL %
         * ==============================
         *
         * Goals are not included yet
         * because Goals is not implemented.
         */
        const overallPercentage =
          Math.round(
            (prayerPercentage +
              quranPercentage) /
              2
          );

        setSummary({
          prayer: prayerPercentage,
          quran: quranPercentage,
          overall: overallPercentage,
        });
      } catch (error) {
        console.error(
          "Could not load weekly summary:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWeeklySummary();

    /*
     * Refresh when prayer/Quran data changes.
     */
    function handleDataUpdate() {
      void loadWeeklySummary();
    }

    window.addEventListener(
      "quran-data-updated",
      handleDataUpdate
    );

    window.addEventListener(
      "prayer-data-updated",
      handleDataUpdate
    );

    return () => {
      active = false;

      window.removeEventListener(
        "quran-data-updated",
        handleDataUpdate
      );

      window.removeEventListener(
        "prayer-data-updated",
        handleDataUpdate
      );
    };
  }, [
    user,
    authLoading,
  ]);

  const summaryItems = [
    {
      label: "Prayer",
      value: summary.prayer,
    },
    {
      label: "Quran",
      value: summary.quran,
    },
    {
      label: "Goals",
      value: null,
    },
    {
      label: "Overall",
      value: summary.overall,
    },
  ];

  return (
    <DashboardCard>
      <SectionHeader
        title="Weekly Summary"
        subtitle="Your consistency during the last seven days."
      />

      <div className="mt-8 space-y-7">
        {summaryItems.map((item) => (
          <div key={item.label}>
            {item.value === null ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">
                  {item.label}
                </span>

                <span className="font-medium text-slate-500">
                  —
                </span>
              </div>
            ) : (
              <ProgressBar
                label={item.label}
                value={
                  loading
                    ? 0
                    : item.value
                }
              />
            )}
          </div>
        ))}
      </div>

      {loading && (
        <p className="mt-5 text-sm text-slate-500">
          Loading your weekly activity...
        </p>
      )}
    </DashboardCard>
  );
}