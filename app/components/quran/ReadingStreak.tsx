"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getQuranReadingStats,
  type QuranReadingStats,
} from "@/lib/quran";

const emptyStats: QuranReadingStats = {
  currentStreak: 0,
  longestStreak: 0,
  daysThisWeek: 0,
  totalPages: 0,
};

export default function ReadingStreak() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [stats, setStats] =
    useState<QuranReadingStats>(
      emptyStats
    );

  const [loading, setLoading] =
    useState(true);

  async function loadStats() {
    if (!user) {
      setStats(emptyStats);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data =
        await getQuranReadingStats(
          user.uid
        );

      setStats(data);
    } catch (error) {
      console.error(
        "Could not load Quran reading statistics:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadStats();
  }, [
    user,
    authLoading,
  ]);

  /* =====================================================
     REFRESH WHEN QURAN DATA CHANGES
  ===================================================== */

  useEffect(() => {
    function handleQuranUpdate() {
      void loadStats();
    }

    window.addEventListener(
      "quran-data-updated",
      handleQuranUpdate
    );

    return () => {
      window.removeEventListener(
        "quran-data-updated",
        handleQuranUpdate
      );
    };
  }, [user]);

  /* =====================================================
     AUTOMATIC NEW DAY
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    function todayKey() {
      const now = new Date();

      return `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`;
    }

    let previousDate =
      todayKey();

    const interval =
      window.setInterval(() => {
        const currentDate =
          todayKey();

        if (
          currentDate !==
          previousDate
        ) {
          previousDate =
            currentDate;

          void loadStats();
        }
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [user]);

  return (
    <div className="rounded-2xl border border-[#172235] bg-[#07111F] p-6 shadow-sm transition-all duration-300 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-400">
            Reading Streak
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            🔥{" "}
            {loading
              ? "..."
              : `${stats.currentStreak} Days`}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Keep your streak alive by reading today.
          </p>

        </div>

        <div className="rounded-xl bg-emerald-500/10 p-3">
          <Flame className="h-7 w-7 text-emerald-400" />
        </div>

      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">

        {/* THIS WEEK */}

        <div className="rounded-xl border border-[#172235] bg-[#081522] p-3 text-center">

          <p className="text-xs text-slate-400">
            This Week
          </p>

          <p className="mt-1 font-bold text-white">
            {loading
              ? "..."
              : `${stats.daysThisWeek} / 7`}
          </p>

        </div>

        {/* LONGEST */}

        <div className="rounded-xl border border-[#172235] bg-[#081522] p-3 text-center">

          <p className="text-xs text-slate-400">
            Longest
          </p>

          <p className="mt-1 font-bold text-white">
            {loading
              ? "..."
              : `${stats.longestStreak} Days`}
          </p>

        </div>

        {/* TOTAL PAGES */}

        <div className="rounded-xl border border-[#172235] bg-[#081522] p-3 text-center">

          <p className="text-xs text-slate-400">
            Pages
          </p>

          <p className="mt-1 font-bold text-white">
            {loading
              ? "..."
              : stats.totalPages}
          </p>

        </div>

      </div>

    </div>
  );
}