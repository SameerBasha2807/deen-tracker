import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { TrackablePrayerName } from "@/lib/types";

export type DailyGoalCategory =
  | "prayer"
  | "quran"
  | "surah"
  | "dhikr"
  | "custom";

export type DailyGoalActivityType =
  | "prayer"
  | "quran_pages"
  | "quran_template"
  | "custom";

export interface DailyGoalActivity {
  id: string;
  title: string;
  category: DailyGoalCategory;
  type: DailyGoalActivityType;

  prayerName?: TrackablePrayerName;
  targetPages?: number;
  quranTemplateId?: string;
}

export interface DailyGoalTemplate {
  id: string;
  activities: DailyGoalActivity[];
  createdAt: number;
  updatedAt: number;
}

export interface DailyGoalRecord {
  id: string;
  date: string;
  activities: DailyGoalActivity[];
  completed: Record<string, boolean>;
  percentage: number;
  completedCount: number;
  totalCount: number;
  updatedAt: number;
}

function templateDocument(userId: string) {
  return doc(
    db,
    "users",
    userId,
    "dailyGoalTemplates",
    "main"
  );
}

function recordsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "dailyGoalRecords"
  );
}

function recordDocument(userId: string, date: string) {
  return doc(
    db,
    "users",
    userId,
    "dailyGoalRecords",
    date
  );
}

function calculateProgress(
  activities: DailyGoalActivity[],
  completed: Record<string, boolean>
) {
  const totalCount = activities.length;

  const completedCount = activities.filter(
    (activity) => completed[activity.id] === true
  ).length;

  const percentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);

  return {
    completedCount,
    totalCount,
    percentage,
  };
}

export async function getDailyGoalTemplate(
  userId: string
): Promise<DailyGoalTemplate | null> {
  const snapshot = await getDoc(templateDocument(userId));

  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  return {
    id: "main",
    activities: Array.isArray(data.activities)
      ? (data.activities as DailyGoalActivity[])
      : [],
    createdAt:
      typeof data.createdAt === "number"
        ? data.createdAt
        : Date.now(),
    updatedAt:
      typeof data.updatedAt === "number"
        ? data.updatedAt
        : Date.now(),
  };
}

export async function saveDailyGoalTemplate(
  userId: string,
  activities: DailyGoalActivity[]
): Promise<DailyGoalTemplate> {
  const reference = templateDocument(userId);
  const existing = await getDoc(reference);
  const now = Date.now();

  const template: DailyGoalTemplate = {
    id: "main",
    activities,
    createdAt: existing.exists()
      ? existing.data().createdAt ?? now
      : now,
    updatedAt: now,
  };

  await setDoc(reference, template);

  return template;
}

export async function getDailyGoalRecord(
  userId: string,
  date: string
): Promise<DailyGoalRecord | null> {
  const snapshot = await getDoc(recordDocument(userId, date));

  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  const activities = Array.isArray(data.activities)
    ? (data.activities as DailyGoalActivity[])
    : [];

  const completed =
    data.completed &&
    typeof data.completed === "object"
      ? (data.completed as Record<string, boolean>)
      : {};

  const progress = calculateProgress(activities, completed);

  return {
    id: date,
    date,
    activities,
    completed,
    percentage: progress.percentage,
    completedCount: progress.completedCount,
    totalCount: progress.totalCount,
    updatedAt:
      typeof data.updatedAt === "number"
        ? data.updatedAt
        : Date.now(),
  };
}

export async function saveDailyGoalRecord(
  userId: string,
  date: string,
  activities: DailyGoalActivity[],
  completed: Record<string, boolean>
): Promise<DailyGoalRecord> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid daily goal date.");
  }

  const progress = calculateProgress(activities, completed);

  const record: DailyGoalRecord = {
    id: date,
    date,
    activities,
    completed,
    ...progress,
    updatedAt: Date.now(),
  };

  await setDoc(recordDocument(userId, date), record);

  return record;
}

export async function getDailyGoalRecords(
  userId: string
): Promise<DailyGoalRecord[]> {
  const snapshot = await getDocs(recordsCollection(userId));

  return snapshot.docs
    .map((item) => {
      const data = item.data();

      const activities = Array.isArray(data.activities)
        ? (data.activities as DailyGoalActivity[])
        : [];

      const completed =
        data.completed &&
        typeof data.completed === "object"
          ? (data.completed as Record<string, boolean>)
          : {};

      const progress = calculateProgress(activities, completed);

      return {
        id: item.id,
        date: item.id,
        activities,
        completed,
        percentage: progress.percentage,
        completedCount: progress.completedCount,
        totalCount: progress.totalCount,
        updatedAt:
          typeof data.updatedAt === "number"
            ? data.updatedAt
            : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}