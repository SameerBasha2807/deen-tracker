"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Target,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyQuranLog,
  getQuranSettings,
  getQuranReadingStreak,
} from "@/lib/quran";

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function formattedToday() {
  const now = new Date();

  return now.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function QuranHero() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [pagesRead, setPagesRead] =
    useState(0);

  const [dailyGoal, setDailyGoal] =
    useState(5);

  const [streak, setStreak] =
    useState(0);

  const [dateLabel, setDateLabel] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function loadQuranData() {
    if (!user) {
      setPagesRead(0);
      setDailyGoal(5);
      setStreak(0);
      setDateLabel(formattedToday());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const date =
        todayLocalDate();

      const [
        log,
        settings,
        currentStreak,
      ] = await Promise.all([
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

      setPagesRead(
        log.pagesRead
      );

      setDailyGoal(
        settings.dailyGoal
      );

      setStreak(
        currentStreak
      );

      setDateLabel(
        formattedToday()
      );
    } catch (error) {
      console.error(
        "Could not load Quran hero data:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadQuranData();
  }, [
    user,
    authLoading,
  ]);

  /* =========================================
     LISTEN FOR QURAN UPDATES
  ========================================= */

  useEffect(() => {
    function handleQuranUpdate() {
      void loadQuranData();
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

  /* =========================================
     AUTOMATIC NEW DAY
  ========================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    let previousDate =
      todayLocalDate();

    const interval =
      window.setInterval(() => {
        const currentDate =
          todayLocalDate();

        if (
          currentDate !==
          previousDate
        ) {
          previousDate =
            currentDate;

          void loadQuranData();
        }
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [user]);

  return (
    <section className="rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-10 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT SIDE */}

        <div>
          <p className="text-emerald-100">
            {dateLabel}
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Quran Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-emerald-100">
            Build a lifelong relationship with the Quran by reading,
            reflecting and staying consistent every single day.
          </p>
        </div>

        {/* RIGHT SIDE */}

        <div className="grid grid-cols-2 gap-4">

          {/* PAGES TODAY */}

          <div className="rounded-2xl border border-white/10 bg-black/10 p-6 backdrop-blur-sm">

            <Target className="mb-3" />

            <h2 className="text-4xl font-bold">
              {loading
                ? "..."
                : `${pagesRead}/${dailyGoal}`}
            </h2>

            <p className="text-sm text-emerald-100">
              Pages Today
            </p>

          </div>

          {/* STREAK */}

          <div className="rounded-2xl border border-white/10 bg-black/10 p-6 backdrop-blur-sm">

            <Flame className="mb-3" />

            <h2 className="text-4xl font-bold">
              {loading
                ? "..."
                : streak}
            </h2>

            <p className="text-sm text-emerald-100">
              Day Streak
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}