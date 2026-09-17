"use client";

import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";

import {
  getQuranMonthReading,
  type QuranMonthReading,
} from "@/lib/quran";

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export default function ReadingHeatmap() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [readingDays, setReadingDays] =
    useState<QuranMonthReading[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * Current month.
   *
   * 0 = January
   * 11 = December
   */
  const [currentDate, setCurrentDate] =
    useState(() => new Date());

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  /*
   * JavaScript:
   *
   * Sunday = 0
   * Monday = 1
   * ...
   * Saturday = 6
   *
   * We want Monday to be
   * the first column.
   */
  const firstDayOfMonth =
    new Date(
      year,
      month,
      1
    ).getDay();

  const mondayOffset =
    firstDayOfMonth === 0
      ? 6
      : firstDayOfMonth - 1;

  /*
   * Create the calendar cells.
   *
   * Empty cells before the
   * first day are represented
   * by null.
   */
  const calendarDays = useMemo(() => {
    const cells: Array<
      number | null
    > = [];

    for (
      let i = 0;
      i < mondayOffset;
      i++
    ) {
      cells.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push(day);
    }

    return cells;
  }, [
    mondayOffset,
    daysInMonth,
  ]);

  /*
   * Make sure the grid has complete
   * rows of 7 days.
   */
  while (
    calendarDays.length % 7 !==
    0
  ) {
    calendarDays.push(null);
  }

  async function loadMonthReading() {
    if (!user) {
      setReadingDays([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data =
        await getQuranMonthReading(
          user.uid,
          year,
          month + 1
        );

      setReadingDays(data);
    } catch (error) {
      console.error(
        "Could not load Quran reading consistency:",
        error
      );

      setReadingDays([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Load current month.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadMonthReading();
  }, [
    user,
    authLoading,
    year,
    month,
  ]);

  /*
   * Refresh whenever Quran
   * page data is saved.
   */
  useEffect(() => {
    function handleQuranUpdate() {
      void loadMonthReading();
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
  }, [
    user,
    year,
    month,
  ]);

  /*
   * Automatically move to the
   * new month after midnight.
   */
  useEffect(() => {
    const interval =
      window.setInterval(() => {
        const now =
          new Date();

        if (
          now.getMonth() !==
            month ||
          now.getFullYear() !==
            year
        ) {
          setCurrentDate(
            now
          );
        }
      }, 60 * 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    month,
    year,
  ]);

  /*
   * Convert Firebase results
   * into a quick lookup.
   */
  const readingMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      readingDays.forEach(
        (item) => {
          map.set(
            item.date,
            item.pagesRead
          );
        }
      );

      return map;
    }, [readingDays]);

  const totalReadingDays =
    readingDays.length;

  const totalPages =
    readingDays.reduce(
      (total, item) =>
        total + item.pagesRead,
      0
    );

  if (authLoading) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm">
        <p className="text-slate-400">
          Loading reading consistency...
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm">
        <SectionHeader
          title="Reading Consistency"
          subtitle="Sign in to see your Quran reading activity."
        />
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:shadow-lg">

      <SectionHeader
        title="Reading Consistency"
        subtitle={`Your Quran reading activity in ${monthName} ${year}.`}
      />

      {/* Monthly summary */}

      <div className="mt-6 flex flex-wrap gap-3">

        <div className="rounded-xl border border-[#172235] bg-[#081522] px-4 py-3">
          <p className="text-xs text-slate-400">
            Reading Days
          </p>

          <p className="mt-1 font-bold text-white">
            {loading
              ? "..."
              : totalReadingDays}
          </p>
        </div>

        <div className="rounded-xl border border-[#172235] bg-[#081522] px-4 py-3">
          <p className="text-xs text-slate-400">
            Pages Read
          </p>

          <p className="mt-1 font-bold text-white">
            {loading
              ? "..."
              : totalPages}
          </p>
        </div>

      </div>

      {/* Week labels */}

      <div className="mt-8 grid grid-cols-7 gap-3 text-center text-xs text-slate-500">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Calendar */}

      <div className="mt-3 grid grid-cols-7 gap-3">

        {calendarDays.map(
          (day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                />
              );
            }

            const date =
              new Date(
                year,
                month,
                day
              );

            const dateKey =
              getDateKey(date);

            const pagesRead =
              readingMap.get(
                dateKey
              ) ?? 0;

            const hasRead =
              pagesRead > 0;

            const isToday =
              dateKey ===
              getDateKey(
                new Date()
              );

            return (
              <div
                key={dateKey}
                title={
                  hasRead
                    ? `${monthName} ${day}: ${pagesRead} page${pagesRead === 1 ? "" : "s"} read`
                    : `${monthName} ${day}: No reading recorded`
                }
                className={`relative aspect-square rounded-xl transition-all duration-300 hover:scale-105 ${
                  hasRead
                    ? "bg-emerald-500"
                    : "bg-[#172235]"
                } ${
                  isToday
                    ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-[#07111F]"
                    : ""
                }`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/80">
                  {day}
                </span>
              </div>
            );
          }
        )}

      </div>

      {/* Legend */}

      <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#172235]" />
          No reading
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500" />
          Read
        </div>

      </div>

    </section>
  );
}