import { create } from "zustand";

import {
  PrayerLog,
  QuranLog,
  UserGoal,
  CharityRecord,
  CharityMath,
} from "@/lib/types";

interface AppState {
  // Data
  prayers: PrayerLog | null;
  quran: QuranLog[];
  goals: UserGoal[];
  charity: CharityRecord[];
  charityMath: CharityMath;

  // Loading
  loading: boolean;

  // Actions
  setPrayers: (p: PrayerLog | null) => void;
  setQuran: (q: QuranLog[]) => void;
  setGoals: (g: UserGoal[]) => void;
  setCharity: (c: CharityRecord[]) => void;
  setCharityMath: (m: CharityMath) => void;
  setLoading: (l: boolean) => void;

  // Math helper
  recalcCharity: (
    records: CharityRecord[]
  ) => void;
}

export const useAppStore =
  create<AppState>((set) => ({
    prayers: null,

    quran: [],

    goals: [],

    charity: [],

    charityMath: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
      allTime: 0,
      dailyHistory: [],
    },

    loading: false,

    setPrayers: (p) =>
      set({
        prayers: p,
      }),

    setQuran: (q) =>
      set({
        quran: q,
      }),

    setGoals: (g) =>
      set({
        goals: g,
      }),

    setCharity: (c) =>
      set({
        charity: c,
      }),

    setCharityMath: (m) =>
      set({
        charityMath: m,
      }),

    setLoading: (l) =>
      set({
        loading: l,
      }),

    recalcCharity: (records) => {
      const now = new Date();

      const todayStr =
        now.toISOString().split("T")[0];

      const getWeekStart = (date: Date) => {
        const d = new Date(date);

        const day = d.getDay();

        const diff =
          d.getDate() -
          day +
          (day === 0 ? -6 : 1);

        d.setDate(diff);

        return d
          .toISOString()
          .split("T")[0];
      };

      const weekStart =
        getWeekStart(new Date());

      const monthStr =
        todayStr.slice(0, 7);

      const yearStr =
        todayStr.slice(0, 4);

      let today = 0;
      let thisWeek = 0;
      let thisMonth = 0;
      let thisYear = 0;
      let allTime = 0;

      const dailyMap: Record<
        string,
        number
      > = {};

      records.forEach((record) => {
        allTime += record.amount;

        if (record.date === todayStr) {
          today += record.amount;
        }

        if (record.date >= weekStart) {
          thisWeek += record.amount;
        }

        if (
          record.date.startsWith(
            monthStr
          )
        ) {
          thisMonth += record.amount;
        }

        if (
          record.date.startsWith(
            yearStr
          )
        ) {
          thisYear += record.amount;
        }

        dailyMap[record.date] =
          (dailyMap[record.date] ?? 0) +
          record.amount;
      });

      const dailyHistory =
        Object.entries(dailyMap)
          .map(([date, total]) => ({
            date,
            total,
          }))
          .sort((a, b) =>
            b.date.localeCompare(
              a.date
            )
          );

      set({
        charityMath: {
          today,
          thisWeek,
          thisMonth,
          thisYear,
          allTime,
          dailyHistory,
        },
      });
    },
  }));