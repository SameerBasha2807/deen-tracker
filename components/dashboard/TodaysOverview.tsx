"use client";

import {
  CheckCircle2,
  BookOpen,
  Flame,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyPrayerLog,
} from "@/lib/prayers";

import {
  getDailyQuranLog,
  getQuranReadingStreak,
} from "@/lib/quran";

import {
  fardPrayerNames,
} from "@/lib/types";

/*
 * ==========================================
 * TODAY'S LOCAL DATE
 * ==========================================
 */

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

/*
 * ==========================================
 * TODAY'S OVERVIEW
 * ==========================================
 */

export default function TodaysOverview() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    completedPrayer,
    setCompletedPrayer,
  ] = useState(0);

  const [
    quranPages,
    setQuranPages,
  ] = useState(0);

  const [
    streak,
    setStreak,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
   * ========================================
   * LOAD TODAY'S DATA
   * ========================================
   */

  const loadOverview =
    useCallback(async () => {
      /*
       * No logged-in user
       */
      if (!user) {
        setCompletedPrayer(0);
        setQuranPages(0);
        setStreak(0);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        const date =
          todayLocalDate();

        /*
         * Load all three pieces of
         * user-specific data together.
         */
        const [
          prayerLog,
          quranLog,
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

          getQuranReadingStreak(
            user.uid
          ),
        ]);

        /*
         * ==================================
         * PRAYER
         * ==================================
         *
         * Count completed Fard prayers.
         *
         * Maximum = 5
         */

        const completed =
          fardPrayerNames.filter(
            (prayer) =>
              prayerLog.fard[
                prayer
              ]
          ).length;

        setCompletedPrayer(
          completed
        );

        /*
         * ==================================
         * QURAN
         * ==================================
         */

        setQuranPages(
          quranLog.pagesRead
        );

        /*
         * ==================================
         * QURAN READING STREAK
         * ==================================
         */

        setStreak(
          readingStreak
        );
      } catch (error) {
        console.error(
          "Could not load today's overview:",
          error
        );

        setCompletedPrayer(0);
        setQuranPages(0);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    }, [user]);

  /*
   * ========================================
   * INITIAL LOAD
   * ========================================
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadOverview();
  }, [
    authLoading,
    loadOverview,
  ]);

  /*
   * ========================================
   * REFRESH WHEN DATA CHANGES
   * ========================================
   */

  useEffect(() => {
    function handlePrayerUpdate() {
      void loadOverview();
    }

    function handleQuranUpdate() {
      void loadOverview();
    }

    window.addEventListener(
      "prayer-data-updated",
      handlePrayerUpdate
    );

    window.addEventListener(
      "quran-data-updated",
      handleQuranUpdate
    );

    return () => {
      window.removeEventListener(
        "prayer-data-updated",
        handlePrayerUpdate
      );

      window.removeEventListener(
        "quran-data-updated",
        handleQuranUpdate
      );
    };
  }, [loadOverview]);

  /*
   * ========================================
   * UI
   * ========================================
   */

  return (
    <DashboardCard>
      <SectionHeader
        title="Today's Overview"
        subtitle="Your progress across today's worship activities."
      />

      {/*
       * THREE CARDS
       *
       * 1 column on mobile
       * 3 equal columns from md upward
       *
       * This makes the three cards
       * spread across the entire container.
       */}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* ================================
            PRAYER
        ================================= */}

        <StatCard
          icon={CheckCircle2}
          title="Prayer"
          value={
            loading
              ? "..."
              : `${completedPrayer} / 5`
          }
        />

        {/* ================================
            QURAN
        ================================= */}

        <StatCard
          icon={BookOpen}
          title="Quran"
          value={
            loading
              ? "..."
              : `${quranPages} Pages`
          }
        />

        {/* ================================
            STREAK
        ================================= */}

        <StatCard
          icon={Flame}
          title="Streak"
          value={
            loading
              ? "..."
              : `${streak} Days`
          }
        />

      </div>
    </DashboardCard>
  );
}