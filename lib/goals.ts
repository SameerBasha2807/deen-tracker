import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  getDailyPrayerLog,
} from "@/lib/prayers";

import {
  getDailyQuranLog,
} from "@/lib/quran";

import {
  fardPrayerNames,
  type GoalCategory,
  type GoalPeriod,
  type GoalTrackingType,
  type GoalUnit,
} from "@/lib/types";

/*
 * ==========================================
 * GOAL TRACKING MODE
 * ==========================================
 */

export type GoalTrackingMode =
  | "automatic"
  | "manual";

/*
 * ==========================================
 * USER GOAL
 * ==========================================
 */

export interface UserGoal {
  id: string;
  userId: string;

  title: string;
  description?: string;

  category: GoalCategory;
  period: GoalPeriod;

  trackingType: GoalTrackingType;
  trackingMode: GoalTrackingMode;

  target: number;
  unit: GoalUnit;

  createdAt: number;
  updatedAt: number;

  active: boolean;

  /*
   * Manual progress storage.
   *
   * The value is reused for the current
   * daily / weekly / monthly period.
   */
  manualProgress?: number;
  manualProgressDate?: string;
  manualProgressWeek?: string;
  manualProgressMonth?: string;
}

/*
 * ==========================================
 * GOAL COMPLETION
 * ==========================================
 */

export interface GoalCompletion {
  id: string;
  userId: string;
  goalId: string;
  completedAt: number;
  period: GoalPeriod;
}

/*
 * ==========================================
 * GOAL PROGRESS
 * ==========================================
 */

export interface GoalProgress {
  goalId: string;
  progress: number;
  target: number;
  percentage: number;
  completed: boolean;
}

/*
 * ==========================================
 * GOAL STATISTICS
 * ==========================================
 */

export interface GoalStats {
  activeGoals: number;
  completedGoals: number;
  successRate: number;
}

/*
 * ==========================================
 * CREATE GOAL INPUT
 * ==========================================
 */

export type CreateGoalInput = {
  title: string;
  description?: string;

  category: GoalCategory;
  period: GoalPeriod;

  trackingType: GoalTrackingType;
  trackingMode: GoalTrackingMode;

  target: number;
  unit: GoalUnit;

  active?: boolean;
};

/*
 * ==========================================
 * FIRESTORE COLLECTIONS
 * ==========================================
 */

function goalsCollection(
  userId: string
) {
  return collection(
    db,
    "users",
    userId,
    "goals"
  );
}

function goalCompletionsCollection(
  userId: string
) {
  return collection(
    db,
    "users",
    userId,
    "goalCompletions"
  );
}

/*
 * ==========================================
 * DATE HELPERS
 * ==========================================
 */

function getLocalDate(
  date = new Date()
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekKey(
  date = new Date()
): string {
  const weekStart =
    new Date(date);

  const day =
    weekStart.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  weekStart.setDate(
    weekStart.getDate() + diff
  );

  return getLocalDate(
    weekStart
  );
}

function getMonthKey(
  date = new Date()
): string {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
  ].join("-");
}

/*
 * ==========================================
 * PERIOD DATES
 * ==========================================
 */

function getPeriodDates(
  period: GoalPeriod
): string[] {
  const today =
    new Date();

  const dates: string[] = [];

  /*
   * Daily
   */

  if (period === "daily") {
    return [
      getLocalDate(today),
    ];
  }

  /*
   * Weekly
   *
   * Monday -> today
   */

  if (period === "weekly") {
    const day =
      today.getDay();

    const mondayOffset =
      day === 0
        ? -6
        : 1 - day;

    const monday =
      new Date(today);

    monday.setDate(
      today.getDate() +
        mondayOffset
    );

    const current =
      new Date(monday);

    while (
      current <= today
    ) {
      dates.push(
        getLocalDate(current)
      );

      current.setDate(
        current.getDate() + 1
      );
    }

    return dates;
  }

  /*
   * Monthly
   *
   * First day of current month
   * -> today
   */

  const firstDay =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  const current =
    new Date(firstDay);

  while (
    current <= today
  ) {
    dates.push(
      getLocalDate(current)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return dates;
}

/*
 * ==========================================
 * CREATE GOAL
 * ==========================================
 */

export async function createGoal(
  userId: string,
  input: CreateGoalInput
): Promise<UserGoal> {
  const goalRef =
    doc(
      goalsCollection(userId)
    );

  const now =
    Date.now();

  const goal: UserGoal = {
    id: goalRef.id,

    userId,

    title:
      input.title,

    ...(input.description?.trim()
      ? {
          description:
            input.description.trim(),
        }
      : {}),

    category:
      input.category,

    period:
      input.period,

    trackingType:
      input.trackingType,

    trackingMode:
      input.trackingMode,

    target:
      input.target,

    unit:
      input.unit,

    createdAt:
      now,

    updatedAt:
      now,

    active:
      input.active ?? true,
  };

  await setDoc(
    goalRef,
    goal
  );

  return goal;
}

/*
 * ==========================================
 * GET USER GOALS
 * ==========================================
 */

export async function getUserGoals(
  userId: string
): Promise<UserGoal[]> {
  const snapshot =
    await getDocs(
      goalsCollection(userId)
    );

  return snapshot.docs.map(
    (item) => {
      const data =
        item.data();

      return {
        id: item.id,

        userId,

        title:
          typeof data.title ===
          "string"
            ? data.title
            : "",

        description:
          typeof data.description ===
          "string"
            ? data.description
            : undefined,

        category:
          data.category as GoalCategory,

        period:
          data.period as GoalPeriod,

        trackingType:
          data.trackingType as GoalTrackingType,

        trackingMode:
          data.trackingMode ===
          "manual"
            ? "manual"
            : "automatic",

        target:
          typeof data.target ===
          "number"
            ? data.target
            : 0,

        unit:
          data.unit as GoalUnit,

        createdAt:
          typeof data.createdAt ===
          "number"
            ? data.createdAt
            : Date.now(),

        updatedAt:
          typeof data.updatedAt ===
          "number"
            ? data.updatedAt
            : Date.now(),

        active:
          typeof data.active ===
          "boolean"
            ? data.active
            : true,

        manualProgress:
          typeof data.manualProgress ===
          "number"
            ? data.manualProgress
            : 0,

        manualProgressDate:
          typeof data.manualProgressDate ===
          "string"
            ? data.manualProgressDate
            : undefined,

        manualProgressWeek:
          typeof data.manualProgressWeek ===
          "string"
            ? data.manualProgressWeek
            : undefined,

        manualProgressMonth:
          typeof data.manualProgressMonth ===
          "string"
            ? data.manualProgressMonth
            : undefined,
      };
    }
  );
}

/*
 * ==========================================
 * SAVE / UPDATE GOAL
 * ==========================================
 */

export async function saveUserGoal(
  userId: string,
  goal: UserGoal
): Promise<void> {
  const goalRef =
    doc(
      db,
      "users",
      userId,
      "goals",
      goal.id
    );

  await setDoc(
    goalRef,
    {
      ...goal,
      userId,
      updatedAt:
        Date.now(),
    },
    {
      merge: true,
    }
  );
}

/*
 * ==========================================
 * UPDATE MANUAL PROGRESS
 * ==========================================
 */

export async function updateManualGoalProgress(
  userId: string,
  goal: UserGoal,
  progress: number
): Promise<void> {
  const goalRef =
    doc(
      db,
      "users",
      userId,
      "goals",
      goal.id
    );

  const now =
    new Date();

  const safeProgress =
    Math.max(
      0,
      Math.min(
        progress,
        goal.target
      )
    );

  const data: Record<
    string,
    unknown
  > = {
    manualProgress:
      safeProgress,

    updatedAt:
      Date.now(),
  };

  if (
    goal.period ===
    "daily"
  ) {
    data.manualProgressDate =
      getLocalDate(now);
  }

  if (
    goal.period ===
    "weekly"
  ) {
    data.manualProgressWeek =
      getWeekKey(now);
  }

  if (
    goal.period ===
    "monthly"
  ) {
    data.manualProgressMonth =
      getMonthKey(now);
  }

  await setDoc(
    goalRef,
    data,
    {
      merge: true,
    }
  );
}

/*
 * ==========================================
 * DELETE GOAL
 * ==========================================
 */

export async function deleteUserGoal(
  userId: string,
  goalId: string
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "goals",
      goalId
    )
  );
}

/*
 * ==========================================
 * RECORD GOAL COMPLETION
 * ==========================================
 */

export async function recordGoalCompletion(
  userId: string,
  goalId: string,
  period: GoalPeriod
): Promise<GoalCompletion> {
  const completionRef =
    doc(
      goalCompletionsCollection(
        userId
      )
    );

  const completion:
    GoalCompletion = {
    id:
      completionRef.id,

    userId,

    goalId,

    completedAt:
      Date.now(),

    period,
  };

  await setDoc(
    completionRef,
    completion
  );

  return completion;
}

/*
 * ==========================================
 * GET GOAL COMPLETIONS
 * ==========================================
 */

export async function getGoalCompletions(
  userId: string
): Promise<GoalCompletion[]> {
  const snapshot =
    await getDocs(
      goalCompletionsCollection(
        userId
      )
    );

  return snapshot.docs
    .map(
      (item) => {
        const data =
          item.data();

        return {
          id: item.id,

          userId,

          goalId:
            typeof data.goalId ===
            "string"
              ? data.goalId
              : "",

          completedAt:
            typeof data.completedAt ===
            "number"
              ? data.completedAt
              : 0,

          period:
            data.period as GoalPeriod,
        };
      }
    )
    .filter(
      (completion) =>
        completion.goalId !== ""
    );
}

/*
 * ==========================================
 * AUTOMATIC DAILY ACTIVITY
 * ==========================================
 */

async function getAutomaticDailyProgress(
  userId: string,
  goal: UserGoal,
  date: string
): Promise<number> {

  /*
   * Prayer
   */

  if (
    goal.trackingType ===
    "prayer"
  ) {
    const prayerLog =
      await getDailyPrayerLog(
        userId,
        date
      );

    return fardPrayerNames.filter(
      (prayer) =>
        prayerLog.fard[
          prayer
        ] === true
    ).length;
  }

  /*
   * Quran pages
   */

  if (
    goal.trackingType ===
    "quran_pages"
  ) {
    const quranLog =
      await getDailyQuranLog(
        userId,
        date
      );

    return Math.max(
      0,
      quranLog.pagesRead
    );
  }

  /*
   * Other automatic types
   *
   * These can be connected later
   * when their activity modules
   * expose daily progress.
   */

  return 0;
}

/*
 * ==========================================
 * AUTOMATIC GOAL PROGRESS
 * ==========================================
 */

async function getAutomaticGoalProgress(
  userId: string,
  goal: UserGoal
): Promise<number> {
  const dates =
    getPeriodDates(
      goal.period
    );

  const dailyProgress =
    await Promise.all(
      dates.map(
        (date) =>
          getAutomaticDailyProgress(
            userId,
            goal,
            date
          )
      )
    );

  return dailyProgress.reduce(
    (
      total,
      value
    ) =>
      total + value,
    0
  );
}

/*
 * ==========================================
 * MANUAL GOAL PROGRESS
 * ==========================================
 */

function getManualGoalProgress(
  goal: UserGoal
): number {
  const now =
    new Date();

  /*
   * Daily
   */

  if (
    goal.period ===
    "daily"
  ) {
    if (
      goal.manualProgressDate !==
      getLocalDate(now)
    ) {
      return 0;
    }

    return Math.max(
      0,
      goal.manualProgress ?? 0
    );
  }

  /*
   * Weekly
   */

  if (
    goal.period ===
    "weekly"
  ) {
    if (
      goal.manualProgressWeek !==
      getWeekKey(now)
    ) {
      return 0;
    }

    return Math.max(
      0,
      goal.manualProgress ?? 0
    );
  }

  /*
   * Monthly
   */

  if (
    goal.period ===
    "monthly"
  ) {
    if (
      goal.manualProgressMonth !==
      getMonthKey(now)
    ) {
      return 0;
    }

    return Math.max(
      0,
      goal.manualProgress ?? 0
    );
  }

  return 0;
}

/*
 * ==========================================
 * GET GOAL PROGRESS
 * ==========================================
 */

export async function getGoalProgress(
  userId: string,
  goal: UserGoal
): Promise<GoalProgress> {
  let progress = 0;

  /*
   * Automatic
   */

  if (
    goal.trackingMode ===
    "automatic"
  ) {
    progress =
      await getAutomaticGoalProgress(
        userId,
        goal
      );
  }

  /*
   * Manual
   */

  if (
    goal.trackingMode ===
    "manual"
  ) {
    progress =
      getManualGoalProgress(
        goal
      );
  }

  const target =
    Math.max(
      1,
      goal.target
    );

  const safeProgress =
    Math.min(
      Math.max(
        0,
        progress
      ),
      target
    );

  const percentage =
    Math.min(
      100,
      Math.round(
        (safeProgress /
          target) *
          100
      )
    );

  return {
    goalId:
      goal.id,

    progress:
      safeProgress,

    target,

    percentage,

    completed:
      safeProgress >= target,
  };
}

/*
 * ==========================================
 * GET ALL GOAL PROGRESS
 * ==========================================
 */

export async function getAllGoalProgress(
  userId: string,
  goals: UserGoal[]
): Promise<
  Record<
    string,
    GoalProgress
  >
> {
  const results =
    await Promise.all(
      goals.map(
        async (goal) => {
          const progress =
            await getGoalProgress(
              userId,
              goal
            );

          return [
            goal.id,
            progress,
          ] as const;
        }
      )
    );

  return Object.fromEntries(
    results
  );
}

/*
 * ==========================================
 * GET GOAL STATISTICS
 * ==========================================
 */

export async function getUserGoalStats(
  userId: string
): Promise<GoalStats> {
  const goals =
    await getUserGoals(
      userId
    );

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
      successRate: 0,
    };
  }

  const progressResults =
    await Promise.all(
      activeGoals.map(
        (goal) =>
          getGoalProgress(
            userId,
            goal
          )
      )
    );

  const completedGoals =
    progressResults.filter(
      (progress) =>
        progress.completed
    ).length;

  const successRate =
    Math.round(
      (completedGoals /
        activeGoals.length) *
        100
    );

  return {
    activeGoals:
      activeGoals.length,

    completedGoals,

    successRate,
  };
}