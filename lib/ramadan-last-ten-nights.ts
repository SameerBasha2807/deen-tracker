
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const RAMADAN_LAST_TEN_NIGHTS = [
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
] as const;

export type LastTenNightNumber =
  (typeof RAMADAN_LAST_TEN_NIGHTS)[number];

export const LAST_TEN_NIGHT_ACTIVITIES = [
  { id: "tahajjud", label: "Tahajjud / Qiyam", description: "Night prayer" },
  { id: "quran", label: "Quran recitation", description: "Recitation and reflection" },
  { id: "dua", label: "Dua", description: "Personal supplications" },
  { id: "istighfar", label: "Istighfar", description: "Seeking forgiveness" },
  { id: "dhikr", label: "Dhikr", description: "Remembering Allah" },
  { id: "salawat", label: "Salawat", description: "Sending blessings upon the Prophet ﷺ" },
  { id: "charity", label: "Sadaqah / Charity", description: "Giving in charity" },
  { id: "itikaf", label: "I'tikaf", description: "Devoting time to worship" },
] as const;

export type LastTenNightActivityId =
  (typeof LAST_TEN_NIGHT_ACTIVITIES)[number]["id"];

export interface LastTenNightsSettings {
  night21StartDate: string;
}

export interface LastTenNightLog {
  id: string;
  nightNumber: LastTenNightNumber;
  gregorianDate: string;
  completedActivities: LastTenNightActivityId[];
  duaAndReflection: string;
  updatedAt?: unknown;
}

export interface LastTenNightInput {
  gregorianDate: string;
  completedActivities: LastTenNightActivityId[];
  duaAndReflection: string;
}

export interface LastTenNightsData {
  settings: LastTenNightsSettings | null;
  logs: Partial<Record<LastTenNightNumber, LastTenNightLog>>;
}

function validateUser(userId: string) {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }
}

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function settingsRef(userId: string) {
  return doc(
    db,
    "users",
    userId,
    "ramadanLastTenNightsSettings",
    "settings"
  );
}

function logsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "ramadanLastTenNights"
  );
}

export async function getRamadanLastTenNightsData(
  userId: string
): Promise<LastTenNightsData> {
  validateUser(userId);

  const [settingsSnapshot, logsSnapshot] = await Promise.all([
    getDoc(settingsRef(userId)),
    getDocs(logsCollection(userId)),
  ]);

  const settings = settingsSnapshot.exists()
    ? {
        night21StartDate:
          settingsSnapshot.data().night21StartDate as string,
      }
    : null;

  const logs: Partial<
    Record<LastTenNightNumber, LastTenNightLog>
  > = {};

  logsSnapshot.docs.forEach((item) => {
    const data = item.data();
    const nightNumber = Number(data.nightNumber);

    if (
      RAMADAN_LAST_TEN_NIGHTS.includes(
        nightNumber as LastTenNightNumber
      )
    ) {
      logs[nightNumber as LastTenNightNumber] = {
        id: item.id,
        nightNumber: nightNumber as LastTenNightNumber,
        gregorianDate: data.gregorianDate ?? "",
        completedActivities: Array.isArray(data.completedActivities)
          ? data.completedActivities
          : [],
        duaAndReflection: data.duaAndReflection ?? "",
        updatedAt: data.updatedAt,
      };
    }
  });

  return { settings, logs };
}

export async function saveLastTenNightsSettings(
  userId: string,
  night21StartDate: string
): Promise<void> {
  validateUser(userId);

  if (!isValidDateOnly(night21StartDate)) {
    throw new Error("Please enter a valid date for the 21st night.");
  }

  await setDoc(
    settingsRef(userId),
    {
      night21StartDate,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveLastTenNightLog(
  userId: string,
  nightNumber: LastTenNightNumber,
  input: LastTenNightInput
): Promise<void> {
  validateUser(userId);

  if (
    !RAMADAN_LAST_TEN_NIGHTS.includes(nightNumber)
  ) {
    throw new Error("Invalid Ramadan night.");
  }

  if (
    input.gregorianDate &&
    !isValidDateOnly(input.gregorianDate)
  ) {
    throw new Error("Please enter a valid Gregorian date.");
  }

  if (input.duaAndReflection.length > 2000) {
    throw new Error("Your reflection must be 2000 characters or fewer.");
  }

  const allowedActivities = LAST_TEN_NIGHT_ACTIVITIES.map(
    (activity) => activity.id
  );

  const completedActivities = [
    ...new Set(input.completedActivities),
  ];

  if (
    completedActivities.some(
      (activity) => !allowedActivities.includes(activity)
    )
  ) {
    throw new Error("An invalid worship activity was selected.");
  }

  await setDoc(
    doc(
      db,
      "users",
      userId,
      "ramadanLastTenNights",
      `night_${nightNumber}`
    ),
    {
      nightNumber,
      gregorianDate: input.gregorianDate,
      completedActivities,
      duaAndReflection: input.duaAndReflection.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
