"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyQuranLog,
  getQuranSettings,
} from "@/lib/quran";

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export default function QuranProgress() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [pagesRead, setPagesRead] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [loading, setLoading] = useState(true);

  /*
   * Load today's Quran progress.
   *
   * The user is captured as currentUser after
   * checking that a user exists. This prevents
   * TypeScript "user is possibly null" errors.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setPagesRead(0);
      setDailyGoal(5);
      setLoading(false);
      return;
    }

    const currentUser = user;
    let active = true;

    async function loadProgress() {
      try {
        const date = todayLocalDate();

        const [log, settings] =
          await Promise.all([
            getDailyQuranLog(
              currentUser.uid,
              date
            ),
            getQuranSettings(
              currentUser.uid
            ),
          ]);

        if (!active) {
          return;
        }

        setPagesRead(log.pagesRead);
        setDailyGoal(settings.dailyGoal);
      } catch (error) {
        console.error(
          "Could not load Quran progress:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    /*
     * Initial load
     */
    void loadProgress();

    /*
     * Reload whenever Quran data changes.
     */
    function handleQuranUpdate() {
      console.log(
        "Quran data updated — refreshing dashboard"
      );

      void loadProgress();
    }

    window.addEventListener(
      "quran-data-updated",
      handleQuranUpdate
    );

    return () => {
      active = false;

      window.removeEventListener(
        "quran-data-updated",
        handleQuranUpdate
      );
    };
  }, [user, authLoading]);

  /*
   * Automatically refresh when the date changes
   * at midnight.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    let previousDate = todayLocalDate();

    const interval = window.setInterval(() => {
      const currentDate = todayLocalDate();

      if (currentDate !== previousDate) {
        previousDate = currentDate;

        window.dispatchEvent(
          new Event("quran-data-updated")
        );
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [user]);

  /*
   * Calculate today's progress percentage.
   */
  const progress =
    dailyGoal > 0
      ? Math.min(
          Math.round(
            (pagesRead / dailyGoal) * 100
          ),
          100
        )
      : 0;

  return (
    <div className="rounded-2xl border border-[#172235] bg-[#07111F] p-6 shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Today's Quran
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {loading
              ? "..."
              : `${pagesRead} / ${dailyGoal} Pages`}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your daily reading goal
          </p>
        </div>

        <div className="rounded-xl bg-emerald-500/10 p-3">
          <BookOpen className="h-7 w-7 text-emerald-400" />
        </div>
      </div>

      {/* Progress */}

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">
            Daily Progress
          </span>

          <span className="font-medium text-emerald-400">
            {loading
              ? "..."
              : `${progress}%`}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#172235]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Stats */}

      <div className="mt-6 grid grid-cols-2 gap-4">

        {/* Daily Goal */}

        <div className="rounded-xl border border-[#172235] bg-[#081522] p-4">
          <p className="text-xs text-slate-400">
            Daily Goal
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {loading
              ? "..."
              : `${dailyGoal} Pages`}
          </p>
        </div>

        {/* Pages Read */}

        <div className="rounded-xl border border-[#172235] bg-[#081522] p-4">
          <p className="text-xs text-slate-400">
            Pages Read
          </p>

          <div className="mt-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />

            <span className="font-semibold text-white">
              {loading
                ? "..."
                : pagesRead}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}