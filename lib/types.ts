export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

/* =====================================================
   PRAYER
===================================================== */

export interface PrayerLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD

  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;

  fajrOnTime: boolean;
  dhuhrOnTime: boolean;
  asrOnTime: boolean;
  maghribOnTime: boolean;
  ishaOnTime: boolean;
}

export const fardPrayerNames = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

export const voluntaryPrayerNames = [
  "sunnah",
  "nafl",
  "witr",
  "tahajjud",
  "ishraq",
  "tawbah",
] as const;

export type FardPrayerName =
  (typeof fardPrayerNames)[number];

export type VoluntaryPrayerName =
  (typeof voluntaryPrayerNames)[number];

export type TrackablePrayerName =
  | FardPrayerName
  | VoluntaryPrayerName;

export interface DailyPrayerLog {
  date: string;

  fard: Record<
    FardPrayerName,
    boolean
  >;

  voluntary: Record<
    VoluntaryPrayerName,
    boolean
  >;

  updatedAt: number;
}

/* =====================================================
   QURAN
===================================================== */

export interface QuranLog {
  id?: string;
  userId: string;
  date: string;

  pagesRead: number;

  surah?: string;

  ayahStart?: number;
  ayahEnd?: number;

  juz?: number;
}

/* =====================================================
   GOALS
===================================================== */

export type GoalCategory =
  | "prayer"
  | "quran"
  | "dhikr"
  | "fasting"
  | "charity"
  | "learning";

export type GoalPeriod =
  | "daily"
  | "weekly"
  | "monthly";

/*
 * What the goal actually tracks.
 *
 * Examples:
 *
 * prayer       → completed Salah
 * quran_pages  → Quran pages
 * quran_surahs → completed Surahs
 * quran_juz    → completed Juz
 * dhikr        → Dhikr repetitions
 * fasting      → fasting days
 * charity      → charity amount/records
 * learning     → Islamic learning activities
 * manual       → manually tracked goal
 */

export type GoalTrackingType =
  | "prayer"
  | "quran_pages"
  | "quran_surahs"
  | "quran_juz"
  | "dhikr"
  | "fasting"
  | "charity"
  | "learning"
  | "manual";

/*
 * How the progress is updated.
 *
 * automatic:
 * DeenTracker calculates progress
 * from existing user activity.
 *
 * manual:
 * User records the progress themselves.
 */

export type GoalTrackingMode =
  | "automatic"
  | "manual";

/*
 * Unit used when displaying progress.
 */

export type GoalUnit =
  | "prayers"
  | "pages"
  | "surahs"
  | "juz"
  | "times"
  | "days"
  | "amount"
  | "items";

/*
 * Complete user-specific goal.
 */

export interface UserGoal {
  id: string;

  userId: string;

  title: string;

  category: GoalCategory;

  period: GoalPeriod;

  trackingType: GoalTrackingType;

  trackingMode: GoalTrackingMode;

  unit: GoalUnit;

  target: number;

  /*
   * Optional description shown
   * on the Goals page.
   */
  description?: string;

  /*
   * Optional date boundaries.
   *
   * YYYY-MM-DD
   */
  startDate?: string;

  endDate?: string;

  /*
   * Whether this goal is currently
   * active for the user.
   */
  active: boolean;

  createdAt: number;

  updatedAt: number;
}

/* =====================================================
   CHARITY
===================================================== */

export interface CharityRecord {
  id?: string;

  userId: string;

  amount: number;

  date: string; // YYYY-MM-DD

  category:
    | "sadaqah"
    | "zakat"
    | "fitrah"
    | "fidya"
    | "other";

  note?: string;

  createdAt: number;
}

export interface CharityMath {
  today: number;

  thisWeek: number;

  thisMonth: number;

  thisYear: number;

  allTime: number;

  dailyHistory: {
    date: string;
    total: number;
  }[];
}
/* =====================================================
   LEADERBOARD
===================================================== */

export interface LeaderboardUser {
  uid: string;
  username: string;
  name: string;
  points: number;
  prayerPoints: number;
  quranPoints: number;
  charityPoints: number;
}
/* =====================================================
   LEADERBOARD
===================================================== */

export interface LeaderboardUser {
  uid: string;

  username: string;

  name: string;

  points: number;

  prayerPoints: number;

  quranPoints: number;

  charityPoints: number;
}