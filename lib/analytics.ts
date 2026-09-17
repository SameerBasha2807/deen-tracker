import { getDailyPrayerLog } from "@/lib/prayers";
import { getDailyQuranLog } from "@/lib/quran";
import {
  getUserGoals,
  getGoalCompletions,
  type UserGoal,
} from "@/lib/goals";

import {
  fardPrayerNames,
  voluntaryPrayerNames,
} from "@/lib/types";

/* =====================================================
   TYPES
===================================================== */

export interface DailyAnalytics {
  date: string;

  prayerCompleted: number;
  prayerTotal: number;
  prayerScore: number;

  voluntaryCompleted: number;
  voluntaryTotal: number;

  quranPages: number;

  goalCompleted: number;
  goalTotal: number;

  /*
   * Daily score is now ONLY FARD PRAYERS.
   */
  score: number;

  /*
   * True only when all 5 Fard prayers
   * were completed.
   */
  isPerfectFardDay: boolean;

  hasActivity: boolean;
}

export interface WeeklyGoalSummary {
  activeGoals: number;
  completedGoals: number;
  score: number;
}

export interface AnalyticsData {
  today: DailyAnalytics;
  yesterday: DailyAnalytics;

  /*
   * Weekly growth.
   *
   * 0 until two complete previous
   * weeks are available.
   */
  growth: number;

  /*
   * Fard-only streak.
   */
  currentStreak: number;
  bestStreak: number;

  /*
   * Current week:
   * Monday -> today.
   */
  weekly: DailyAnalytics[];

  /*
   * Current week's Fard score.
   */
  weeklyScore: number;

  /*
   * Fard consistency for current week.
   */
  prayerConsistency: number;

  /*
   * Kept for existing Analytics UI.
   */
  quranConsistency: number;
  goalConsistency: number;

  /*
   * Overall = weekly Fard score.
   */
  overallConsistency: number;

  /*
   * Current week's user-specific goals.
   */
  goals: WeeklyGoalSummary;

  /*
   * Last 35 days.
   */
  monthly: DailyAnalytics[];
}

/* =====================================================
   DATE HELPERS
===================================================== */

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getDateOffset(offset: number): string {
  const date = new Date();

  date.setDate(
    date.getDate() + offset
  );

  return formatDate(date);
}

function parseDate(dateString: string): Date {
  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

/*
 * Monday = start of week.
 */
function getWeekStartDate(
  referenceDate = new Date()
): Date {
  const date = new Date(referenceDate);

  const day = date.getDay();

  /*
   * Sunday = 0
   * Monday = 1
   */
  const daysFromMonday =
    day === 0 ? 6 : day - 1;

  date.setDate(
    date.getDate() -
      daysFromMonday
  );

  date.setHours(0, 0, 0, 0);

  return date;
}

function getWeekStartString(
  offsetWeeks = 0
): string {
  const date =
    getWeekStartDate();

  date.setDate(
    date.getDate() -
      offsetWeeks * 7
  );

  return formatDate(date);
}

function getDatesBetween(
  startDate: string,
  endDate: string
): string[] {
  const dates: string[] = [];

  const current =
    parseDate(startDate);

  const end =
    parseDate(endDate);

  while (current <= end) {
    dates.push(
      formatDate(current)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return dates;
}

/* =====================================================
   NUMBER HELPERS
===================================================== */

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function percentage(
  value: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100
  );
}

/* =====================================================
   DAILY ANALYTICS
===================================================== */

async function calculateDailyAnalytics(
  userId: string,
  date: string
): Promise<DailyAnalytics> {
  const [
    prayerLog,
    quranLog,
    goals,
  ] = await Promise.all([
    getDailyPrayerLog(
      userId,
      date
    ),

    getDailyQuranLog(
      userId,
      date
    ),

    getUserGoals(
      userId
    ),
  ]);

  /* ===================================================
     FARD PRAYERS
  =================================================== */

  const prayerCompleted =
    fardPrayerNames.filter(
      (prayer) =>
        prayerLog.fard[prayer] === true
    ).length;

  const prayerTotal =
    fardPrayerNames.length;

  const prayerScore =
    percentage(
      prayerCompleted,
      prayerTotal
    );

  /*
   * A prayer streak day means
   * ALL 5 Fard prayers completed.
   */
  const isPerfectFardDay =
    prayerCompleted ===
    prayerTotal;

  /* ===================================================
     VOLUNTARY PRAYERS
  =================================================== */

  const voluntaryCompleted =
    voluntaryPrayerNames.filter(
      (prayer) =>
        prayerLog.voluntary[
          prayer
        ] === true
    ).length;

  const voluntaryTotal =
    voluntaryPrayerNames.length;

  /* ===================================================
     QURAN
  =================================================== */

  const quranPages =
    typeof quranLog?.pagesRead ===
    "number"
      ? quranLog.pagesRead
      : 0;

  /* ===================================================
     GOALS
  =================================================== */

  const activeGoals =
    goals.filter(
      (goal) =>
        goal.active === true
    );

  const goalTotal =
    activeGoals.length;

  let goalCompleted = 0;

  for (const goal of activeGoals) {
    let completed = false;

    switch (
      goal.trackingType
    ) {
      case "prayer":
        completed =
          prayerCompleted >=
          goal.target;
        break;

      case "quran_pages":
        completed =
          quranPages >=
          goal.target;
        break;

      /*
       * Current DailyQuranLog does not
       * expose surah/juz fields reliably.
       *
       * These are therefore not
       * automatically completed here.
       */
      case "quran_surahs":
      case "quran_juz":
        completed = false;
        break;

      /*
       * Manual goals are handled through
       * goalCompletions.
       */
      case "manual":
        completed = false;
        break;

      case "dhikr":
      case "fasting":
      case "charity":
      case "learning":
        completed = false;
        break;

      default:
        completed = false;
    }

    if (completed) {
      goalCompleted++;
    }
  }

  const goalScore =
    percentage(
      goalCompleted,
      goalTotal
    );

  /*
   * IMPORTANT:
   *
   * Daily score is ONLY Fard prayers.
   */
  const score =
    prayerScore;

  /*
   * Activity for analytics is also
   * based on Fard prayer activity.
   */
  const hasActivity =
    prayerCompleted > 0;

  return {
    date,

    prayerCompleted,
    prayerTotal,
    prayerScore,

    voluntaryCompleted,
    voluntaryTotal,

    quranPages,

    goalCompleted,
    goalTotal,

    score,

    isPerfectFardDay,

    hasActivity,
  };
}

/* =====================================================
   TODAY + YESTERDAY
===================================================== */

async function getTodayAndYesterday(
  userId: string
) {
  const today =
    getDateOffset(0);

  const yesterday =
    getDateOffset(-1);

  const [
    todayData,
    yesterdayData,
  ] = await Promise.all([
    calculateDailyAnalytics(
      userId,
      today
    ),

    calculateDailyAnalytics(
      userId,
      yesterday
    ),
  ]);

  return {
    today: todayData,
    yesterday: yesterdayData,
  };
}

/* =====================================================
   FARD PRAYER WEEK SCORE
===================================================== */

async function calculatePrayerScoreForDates(
  userId: string,
  dates: string[]
): Promise<number> {
  if (dates.length === 0) {
    return 0;
  }

  const logs =
    await Promise.all(
      dates.map((date) =>
        getDailyPrayerLog(
          userId,
          date
        )
      )
    );

  let completed = 0;

  for (const log of logs) {
    completed +=
      fardPrayerNames.filter(
        (prayer) =>
          log.fard[prayer] === true
      ).length;
  }

  const possible =
    dates.length *
    fardPrayerNames.length;

  return percentage(
    completed,
    possible
  );
}

/* =====================================================
   CURRENT WEEK
===================================================== */

async function getWeeklyAnalytics(
  userId: string
): Promise<DailyAnalytics[]> {
  const weekStart =
    getWeekStartDate();

  const today =
    parseDate(
      getDateOffset(0)
    );

  const dates: string[] = [];

  const current =
    new Date(weekStart);

  while (current <= today) {
    dates.push(
      formatDate(current)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return Promise.all(
    dates.map(
      (date) =>
        calculateDailyAnalytics(
          userId,
          date
        )
    )
  );
}

/* =====================================================
   MONTHLY DATA
===================================================== */

async function getMonthlyAnalytics(
  userId: string
): Promise<DailyAnalytics[]> {
  const dates: string[] = [];

  for (
    let i = 34;
    i >= 0;
    i--
  ) {
    dates.push(
      getDateOffset(-i)
    );
  }

  return Promise.all(
    dates.map(
      (date) =>
        calculateDailyAnalytics(
          userId,
          date
        )
    )
  );
}

/* =====================================================
   FARD STREAK
===================================================== */

async function getPrayerStreak(
  userId: string
): Promise<{
  currentStreak: number;
  bestStreak: number;
}> {
  /*
   * Last 365 days.
   *
   * We use only Fard prayer logs
   * here. Quran, goals, Sunnah,
   * charity etc. cannot affect
   * the prayer streak.
   */
  const dates: string[] = [];

  for (
    let i = 0;
    i < 365;
    i++
  ) {
    dates.push(
      getDateOffset(-i)
    );
  }

  const logs =
    await Promise.all(
      dates.map((date) =>
        getDailyPrayerLog(
          userId,
          date
        )
      )
    );

  const perfectDays =
    logs.map((log, index) => {
      const completed =
        fardPrayerNames.filter(
          (prayer) =>
            log.fard[prayer] === true
        ).length;

      return {
        date: dates[index],
        perfect:
          completed ===
          fardPrayerNames.length,
      };
    });

  /* ===================================================
     CURRENT STREAK
  =================================================== */

  let currentStreak = 0;

  /*
   * If today is not yet a perfect
   * day, preserve yesterday's
   * completed streak.
   */
  let startIndex = 0;

  if (
    !perfectDays[0]?.perfect
  ) {
    startIndex = 1;
  }

  for (
    let i = startIndex;
    i < perfectDays.length;
    i++
  ) {
    if (
      perfectDays[i].perfect
    ) {
      currentStreak++;
    } else {
      break;
    }
  }

  /* ===================================================
     BEST STREAK
  =================================================== */

  let bestStreak = 0;
  let runningStreak = 0;

  const chronological =
    [...perfectDays].reverse();

  for (
    const day of chronological
  ) {
    if (day.perfect) {
      runningStreak++;

      bestStreak =
        Math.max(
          bestStreak,
          runningStreak
        );
    } else {
      runningStreak = 0;
    }
  }

  return {
    currentStreak,
    bestStreak,
  };
}

/* =====================================================
   WEEKLY GROWTH
===================================================== */

/*
 * IMPORTANT:
 *
 * Growth is NOT:
 *
 * today vs yesterday
 *
 * Growth is:
 *
 * previous completed week
 *        vs
 * week before previous
 *
 * Example:
 *
 * Week 1:
 *   score = 70
 *   growth = 0
 *
 * Week 2:
 *   score = 80
 *   growth = 0
 *
 * Week 3:
 *   score = 90
 *   growth =
 *   ((80 - 70) / 70) * 100
 *   = +14%
 *
 * Therefore growth first appears
 * during Week 3.
 */

async function calculateWeeklyGrowth(
  userId: string
): Promise<number> {
  /*
   * Current week = 0
   * Previous completed week = 1
   * Week before that = 2
   */

  const previousWeekStart =
    getWeekStartString(1);

  const weekBeforeStart =
    getWeekStartString(2);

  const previousWeekEnd =
    getDateFromOffset(
      previousWeekStart,
      6
    );

  const weekBeforeEnd =
    getDateFromOffset(
      weekBeforeStart,
      6
    );

  const previousWeekDates =
    getDatesBetween(
      previousWeekStart,
      previousWeekEnd
    );

  const weekBeforeDates =
    getDatesBetween(
      weekBeforeStart,
      weekBeforeEnd
    );

  /*
   * These are TWO completed weeks.
   *
   * If there aren't two completed
   * weeks with meaningful data yet,
   * growth stays 0.
   */
  const [
    previousScore,
    weekBeforeScore,
  ] = await Promise.all([
    calculatePrayerScoreForDates(
      userId,
      previousWeekDates
    ),

    calculatePrayerScoreForDates(
      userId,
      weekBeforeDates
    ),
  ]);

  /*
   * We intentionally do NOT show
   * growth as +100% when the previous
   * week was zero.
   *
   * The user requested a clean
   * weekly comparison.
   */
  if (
    weekBeforeScore === 0
  ) {
    return 0;
  }

  return Math.round(
    (
      (previousScore -
        weekBeforeScore) /
      weekBeforeScore
    ) *
      100
  );
}

/* =====================================================
   DATE FROM START + OFFSET
===================================================== */

function getDateFromOffset(
  startDate: string,
  offset: number
): string {
  const date =
    parseDate(startDate);

  date.setDate(
    date.getDate() + offset
  );

  return formatDate(date);
}

/* =====================================================
   GOAL ANALYTICS
===================================================== */

async function calculateWeeklyGoalSummary(
  userId: string,
  weekly: DailyAnalytics[]
): Promise<WeeklyGoalSummary> {
  const [
    goals,
    completions,
  ] = await Promise.all([
    getUserGoals(userId),
    getGoalCompletions(userId),
  ]);

  const activeGoals =
    goals.filter(
      (goal) =>
        goal.active === true
    );

  if (
    activeGoals.length === 0
  ) {
    return {
      activeGoals: 0,
      completedGoals: 0,
      score: 0,
    };
  }

  const weekStart =
    getWeekStartDate();

  const weekStartTime =
    weekStart.getTime();

  const now =
    Date.now();

  /*
   * Manual / recorded completions
   * during the current week.
   */
  const completedGoalIds =
    new Set(
      completions
        .filter(
          (completion) =>
            completion.completedAt >=
              weekStartTime &&
            completion.completedAt <=
              now
        )
        .map(
          (completion) =>
            completion.goalId
        )
    );

  let completedGoals = 0;

  for (
    const goal of activeGoals
  ) {
    /*
     * If a completion record exists,
     * the goal is completed.
     */
    if (
      completedGoalIds.has(
        goal.id
      )
    ) {
      completedGoals++;
      continue;
    }

    /*
     * Automatic prayer goal.
     */
    if (
      goal.trackingMode ===
        "automatic" &&
      goal.trackingType ===
        "prayer"
    ) {
      let completed = false;

      if (
        goal.period ===
        "daily"
      ) {
        completed =
          weekly.some(
            (day) =>
              day.prayerCompleted >=
              goal.target
          );
      } else {
        /*
         * Weekly target:
         * total Fard prayers completed
         * during current week.
         */
        const total =
          weekly.reduce(
            (sum, day) =>
              sum +
              day.prayerCompleted,
            0
          );

        completed =
          total >= goal.target;
      }

      if (completed) {
        completedGoals++;
      }

      continue;
    }

    /*
     * Automatic Quran pages goal.
     */
    if (
      goal.trackingMode ===
        "automatic" &&
      goal.trackingType ===
        "quran_pages"
    ) {
      let completed = false;

      if (
        goal.period ===
        "daily"
      ) {
        completed =
          weekly.some(
            (day) =>
              day.quranPages >=
              goal.target
          );
      } else {
        const total =
          weekly.reduce(
            (sum, day) =>
              sum +
              day.quranPages,
            0
          );

        completed =
          total >= goal.target;
      }

      if (completed) {
        completedGoals++;
      }

      continue;
    }

    /*
     * Quran surah/juz automatic
     * tracking requires dedicated
     * daily completion fields.
     *
     * They remain uncounted here
     * instead of using fake data.
     */
  }

  return {
    activeGoals:
      activeGoals.length,

    completedGoals,

    score:
      percentage(
        completedGoals,
        activeGoals.length
      ),
  };
}

/* =====================================================
   WEEKLY CONSISTENCY
===================================================== */

function calculateWeeklyConsistency(
  weekly: DailyAnalytics[]
) {
  if (
    weekly.length === 0
  ) {
    return {
      prayer: 0,
      quran: 0,
      goals: 0,
      overall: 0,
    };
  }

  /*
   * FARD ONLY
   *
   * Total completed Fard prayers
   * / total possible Fard prayers
   * in the current week.
   */
  const prayerCompleted =
    weekly.reduce(
      (sum, day) =>
        sum +
        day.prayerCompleted,
      0
    );

  const prayerPossible =
    weekly.reduce(
      (sum, day) =>
        sum +
        day.prayerTotal,
      0
    );

  const prayer =
    percentage(
      prayerCompleted,
      prayerPossible
    );

  /*
   * Quran consistency is kept
   * for the existing Analytics
   * components, but it does NOT
   * affect Worship Score.
   */
  const quranDays =
    weekly.filter(
      (day) =>
        day.quranPages > 0
    ).length;

  const quran =
    percentage(
      quranDays,
      weekly.length
    );

  /*
   * Existing daily goal average.
   */
  const daysWithGoals =
    weekly.filter(
      (day) =>
        day.goalTotal > 0
    );

  const goals =
    daysWithGoals.length === 0
      ? 0
      : Math.round(
          daysWithGoals.reduce(
            (sum, day) =>
              sum +
              percentage(
                day.goalCompleted,
                day.goalTotal
              ),
            0
          ) /
            daysWithGoals.length
        );

  /*
   * OVERALL = FARD ONLY.
   */
  const overall =
    prayer;

  return {
    prayer,
    quran,
    goals,
    overall,
  };
}

/* =====================================================
   MAIN ANALYTICS FUNCTION
===================================================== */

export async function getAnalytics(
  userId: string
): Promise<AnalyticsData> {
  if (!userId) {
    throw new Error(
      "User ID is required for analytics."
    );
  }

  /*
   * Load current analytics.
   */
  const [
    todayYesterday,
    weekly,
    monthly,
    streak,
    growth,
  ] = await Promise.all([
    getTodayAndYesterday(
      userId
    ),

    getWeeklyAnalytics(
      userId
    ),

    getMonthlyAnalytics(
      userId
    ),

    getPrayerStreak(
      userId
    ),

    calculateWeeklyGrowth(
      userId
    ),
  ]);

  /*
   * Current week's Fard score.
   *
   * Example:
   *
   * Monday:
   * 4 / 5 = 80%
   *
   * Tuesday:
   * 8 / 10 = 80%
   *
   * Wednesday:
   * 12 / 15 = 80%
   *
   * It updates every day.
   */
  const prayerCompleted =
    weekly.reduce(
      (sum, day) =>
        sum +
        day.prayerCompleted,
      0
    );

  const prayerPossible =
    weekly.length *
    fardPrayerNames.length;

  const weeklyScore =
    percentage(
      prayerCompleted,
      prayerPossible
    );

  const consistency =
    calculateWeeklyConsistency(
      weekly
    );

  /*
   * User-specific weekly goals.
   */
  const goals =
    await calculateWeeklyGoalSummary(
      userId,
      weekly
    );

  return {
    today:
      todayYesterday.today,

    yesterday:
      todayYesterday.yesterday,

    growth,

    currentStreak:
      streak.currentStreak,

    bestStreak:
      streak.bestStreak,

    weekly,

    weeklyScore,

    prayerConsistency:
      weeklyScore,

    quranConsistency:
      consistency.quran,

    goalConsistency:
      goals.score,

    overallConsistency:
      weeklyScore,

    goals,

    monthly,
  };
}

/* =====================================================
   SCORE LABEL
===================================================== */

export function getScoreLabel(
  score: number
): string {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Very Good";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Needs Improvement";
  }

  return "Getting Started";
}

/* =====================================================
   GROWTH LABEL
===================================================== */

export function getGrowthLabel(
  growth: number
): string {
  if (growth > 0) {
    return `+${growth}%`;
  }

  if (growth < 0) {
    return `${growth}%`;
  }

  return "0%";
}

/* =====================================================
   DATE LABEL
===================================================== */

export function getDayLabel(
  date: string
): string {
  const parsed =
    parseDate(date);

  return parsed.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
    }
  );
}