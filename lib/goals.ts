import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  GoalCategory,
  GoalPeriod,
  GoalTrackingType,
  GoalUnit,
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
}

/*
 * ==========================================
 * GOAL COMPLETION
 * ==========================================
 *
 * Stored at:
 *
 * users/{userId}/goalCompletions/{completionId}
 *
 * A completion represents one successfully
 * completed goal occurrence.
 */

export interface GoalCompletion {
  id: string;
  userId: string;
  goalId: string;

  completedAt: number;

  /*
   * daily / weekly / monthly / custom
   */
  period: GoalPeriod;
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
 * CREATE GOAL
 * ==========================================
 */

export async function createGoal(
  userId: string,
  input: CreateGoalInput
): Promise<UserGoal> {
  const goalRef = doc(
    goalsCollection(userId)
  );

  const now = Date.now();

  const goal: UserGoal = {
    id: goalRef.id,

    userId,

    title: input.title,

    description:
      input.description,

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
  const goalRef = doc(
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
 *
 * Call this when a goal becomes completed.
 *
 * IMPORTANT:
 * The completion document ID is generated
 * automatically by Firestore.
 */

export async function recordGoalCompletion(
  userId: string,
  goalId: string,
  period: GoalPeriod
): Promise<GoalCompletion> {
  const completionRef = doc(
    goalCompletionsCollection(userId)
  );

  const completion: GoalCompletion = {
    id: completionRef.id,

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
      goalCompletionsCollection(userId)
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
 * GET GOAL STATISTICS
 * ==========================================
 *
 * Active Goals:
 *   Number of currently active goals.
 *
 * Completed:
 *   Number of valid completion records
 *   belonging to the user's goals.
 *
 * Success Rate:
 *   completed / active * 100
 *
 * The result is capped at 100%.
 */

export async function getUserGoalStats(
  userId: string
): Promise<GoalStats> {
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

  const activeGoalIds =
    new Set(
      activeGoals.map(
        (goal) =>
          goal.id
      )
    );

  /*
   * Only count completion records for
   * goals that still belong to the user.
   */
  const validCompletions =
    completions.filter(
      (completion) =>
        activeGoalIds.has(
          completion.goalId
        )
    );

  const activeCount =
    activeGoals.length;

  const completedCount =
    validCompletions.length;

  const successRate =
    activeCount === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (completedCount /
              activeCount) *
              100
          )
        );

  return {
    activeGoals:
      activeCount,

    completedGoals:
      completedCount,

    successRate,
  };
}