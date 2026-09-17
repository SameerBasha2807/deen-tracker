"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";

import PageHero from "@/components/ui/PageHero";

import { useAuth } from "@/contexts/AuthContext";

import { getDailyPrayerLog } from "@/lib/prayers";

import {
  getDailyQuranLog,
  getQuranReadingStreak,
  getQuranSettings,
} from "@/lib/quran";

import { fardPrayerNames } from "@/lib/types";

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export default function DashboardHero() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [prayerCount, setPrayerCount] =
    useState(0);

  const [quranPages, setQuranPages] =
    useState(0);

  const [quranGoal, setQuranGoal] =
    useState(5);

  const [streak, setStreak] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const loadDashboardData =
    useCallback(async () => {
      if (!user) {
        setPrayerCount(0);
        setQuranPages(0);
        setQuranGoal(5);
        setStreak(0);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        const date =
          todayLocalDate();

        const [
          prayerLog,
          quranLog,
          quranSettings,
          readingStreak,
        ] = await Promise.all([
          getDailyPrayerLog(
            user.uid,
            date
          ),

          getDailyQuranLog(
            user.uid,
            date
          ),

          getQuranSettings(
            user.uid
          ),

          getQuranReadingStreak(
            user.uid
          ),
        ]);

        const completedPrayers =
          fardPrayerNames.filter(
            (prayer) =>
              prayerLog.fard[prayer]
          ).length;

        setPrayerCount(
          completedPrayers
        );

        setQuranPages(
          quranLog.pagesRead
        );

        setQuranGoal(
          quranSettings.dailyGoal
        );

        setStreak(
          readingStreak
        );
      } catch (error) {
        console.error(
          "Could not load dashboard data:",
          error
        );

        setPrayerCount(0);
        setQuranPages(0);
        setQuranGoal(5);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    }, [user]);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadDashboardData();
  }, [
    authLoading,
    loadDashboardData,
  ]);

  /* =====================================================
     REFRESH WHEN QURAN / PRAYER DATA CHANGES
  ===================================================== */

  useEffect(() => {
    function handleQuranUpdate() {
      void loadDashboardData();
    }

    function handlePrayerUpdate() {
      void loadDashboardData();
    }

    window.addEventListener(
      "quran-data-updated",
      handleQuranUpdate
    );

    window.addEventListener(
      "prayer-data-updated",
      handlePrayerUpdate
    );

    return () => {
      window.removeEventListener(
        "quran-data-updated",
        handleQuranUpdate
      );

      window.removeEventListener(
        "prayer-data-updated",
        handlePrayerUpdate
      );
    };
  }, [loadDashboardData]);

  return (
    <PageHero
      icon={LayoutDashboard}
      title="Dashboard"
      subtitle="Welcome back! Continue building consistency in your daily worship."
      stats={[
        {
          label: "Prayer",
          value: loading
            ? "..."
            : `${prayerCount}/5`,
        },

        {
          label: "Quran",
          value: loading
            ? "..."
            : `${quranPages}/${quranGoal}`,
        },

        {
          label: "Streak",
          value: loading
            ? "..."
            : `${streak}`,
        },
      ]}
    />
  );
}