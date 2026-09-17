"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

import {
  getDailyPrayerLog,
} from "@/lib/prayers";

import {
  getDailyQuranLog,
  getQuranReadingStreak,
  getQuranSettings,
} from "@/lib/quran";

function getTodayKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

export default function DashboardMockup() {
  const [prayerCompleted, setPrayerCompleted] = useState(0);
  const [quranPages, setQuranPages] = useState(0);
  const [quranGoal, setQuranGoal] = useState(5);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setPrayerCompleted(0);
          setQuranPages(0);
          setQuranGoal(5);
          setStreak(0);
          setLoading(false);
          return;
        }

        try {
          const today = getTodayKey();

          const [
            prayerLog,
            quranLog,
            quranSettings,
            quranStreak,
          ] = await Promise.all([
            getDailyPrayerLog(user.uid, today),
            getDailyQuranLog(user.uid, today),
            getQuranSettings(user.uid),
            getQuranReadingStreak(user.uid),
          ]);

          // Count completed Fard prayers
          const completedPrayers = Object.values(
            prayerLog.fard
          ).filter(Boolean).length;

          setPrayerCompleted(completedPrayers);
          setQuranPages(quranLog.pagesRead);
          setQuranGoal(quranSettings.dailyGoal);
          setStreak(quranStreak);
        } catch (error) {
          console.error(
            "Failed to load dashboard progress:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const cards = [
    {
      title: "Prayer",
      icon: "🕌",
      text: `${prayerCompleted} / 5 Completed`,
    },
    {
      title: "Quran",
      icon: "📖",
      text: `${quranPages} ${
        quranPages === 1 ? "Page" : "Pages"
      } Read`,
    },
    {
      title: "Streak",
      icon: "🔥",
      text: `${streak} ${
        streak === 1 ? "Day" : "Days"
      }`,
    },
  ];

  return (
    <div
      className="
        relative
        mx-auto
        mt-20
        w-full
        max-w-5xl
        self-center
        overflow-hidden
        rounded-[36px]
        border
        border-slate-800
        bg-slate-900/70
        p-8
        shadow-[0_30px_80px_rgba(0,0,0,.45)]
        backdrop-blur-2xl
      "
    >
      {/* Glow */}
      <div
        className="
          absolute
          -right-20
          -top-20
          h-72
          w-72
          rounded-full
          bg-emerald-500/10
          blur-[120px]
        "
      />

      <div
        className="
          absolute
          -bottom-20
          -left-20
          h-72
          w-72
          rounded-full
          bg-cyan-500/10
          blur-[120px]
        "
      />

      {/* Window Header */}
      <div className="relative mb-8 flex items-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Title */}
      <div className="relative text-center">
        <h2 className="text-3xl font-bold text-white">
          Today's Progress
        </h2>

        <p className="mt-2 text-slate-400">
          Stay consistent with your daily worship goals.
        </p>
      </div>

      {/* Cards */}
      <div className="relative mx-auto mt-10 grid w-full gap-6 md:grid-cols-3">
        {cards.map((item) => (
          <div
            key={item.title}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-950/70
              p-6
              transition-all
              duration-300
              hover:-translate-y-2
              hover:border-emerald-500/40
            "
          >
            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="mt-6 text-xl font-semibold text-white">
              {item.title}
            </h3>

            {/* Value */}
            <p className="mt-3 text-slate-400">
              {loading ? "Loading..." : item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}