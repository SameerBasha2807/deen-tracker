import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   TYPES
===================================================== */

export type FastingStatus =
  | "completed"
  | "missed"
  | "exempt";

export interface RamadanSeason {
  id: string;
  hijriYear: number;
  startDate: string;
  totalDays: 29 | 30;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface FastingDayRecord {
  dayNumber: number;
  date: string;
  status: FastingStatus;
  note: string;
  updatedAt: number | null;
}

export interface UpdateRamadanSeasonInput {
  hijriYear: number;
  startDate: string;
  totalDays: 29 | 30;
}

/* =====================================================
   COLLECTION REFERENCES
===================================================== */

function seasonsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "ramadanSeasons"
  );
}

function seasonDocument(
  userId: string,
  seasonId: string
) {
  return doc(
    db,
    "users",
    userId,
    "ramadanSeasons",
    seasonId
  );
}

function fastingDaysCollection(
  userId: string,
  seasonId: string
) {
  return collection(
    db,
    "users",
    userId,
    "ramadanSeasons",
    seasonId,
    "fastingDays"
  );
}

function fastingDayDocument(
  userId: string,
  seasonId: string,
  dayNumber: number
) {
  return doc(
    db,
    "users",
    userId,
    "ramadanSeasons",
    seasonId,
    "fastingDays",
    `day_${String(dayNumber).padStart(2, "0")}`
  );
}

/* =====================================================
   HELPERS
===================================================== */

function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (typeof value === "number") {
    return value;
  }

  return null;
}

function validateStartDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid Ramadan start date.");
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    getDateKey(parsed) !== date
  ) {
    throw new Error("Please enter a valid start date.");
  }
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

/* =====================================================
   GET THE DATE OF A RAMADAN DAY
===================================================== */

export function getRamadanDayDate(
  startDate: string,
  dayNumber: number
): string {
  const date = new Date(
    `${startDate}T00:00:00`
  );

  date.setDate(
    date.getDate() + dayNumber - 1
  );

  return getDateKey(date);
}

/* =====================================================
   MAP SEASON DOCUMENT
===================================================== */

function mapSeason(
  id: string,
  data: Record<string, unknown>
): RamadanSeason {
  return {
    id,
    hijriYear: Number(data.hijriYear),
    startDate: String(data.startDate),
    totalDays: data.totalDays === 29 ? 29 : 30,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/* =====================================================
   GET ALL RAMADAN SEASONS
===================================================== */

export async function getRamadanSeasons(
  userId: string
): Promise<RamadanSeason[]> {
  const seasonsQuery = query(
    seasonsCollection(userId),
    orderBy("hijriYear", "desc")
  );

  const snapshot = await getDocs(seasonsQuery);

  return snapshot.docs.map((item) =>
    mapSeason(item.id, item.data())
  );
}

/* =====================================================
   GET ONE RAMADAN SEASON
===================================================== */

export async function getRamadanSeason(
  userId: string,
  seasonId: string
): Promise<RamadanSeason | null> {
  const snapshot = await getDoc(
    seasonDocument(userId, seasonId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return mapSeason(
    snapshot.id,
    snapshot.data()
  );
}

/* =====================================================
   CREATE RAMADAN SEASON
===================================================== */

export async function createRamadanSeason(
  userId: string,
  hijriYear: number,
  startDate: string,
  totalDays: 29 | 30
): Promise<RamadanSeason> {
  if (
    !Number.isInteger(hijriYear) ||
    hijriYear < 1300 ||
    hijriYear > 1600
  ) {
    throw new Error("Enter a valid Hijri year.");
  }

  if (totalDays !== 29 && totalDays !== 30) {
    throw new Error("Ramadan must have 29 or 30 days.");
  }

  validateStartDate(startDate);

  const seasonId = String(hijriYear);

  const seasonRef = seasonDocument(
    userId,
    seasonId
  );

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(
      seasonRef
    );

    if (existing.exists()) {
      throw new Error(
        `Ramadan ${hijriYear} already exists in your history.`
      );
    }

    transaction.set(seasonRef, {
      hijriYear,
      startDate,
      totalDays,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  const result = await getRamadanSeason(
    userId,
    seasonId
  );

  if (!result) {
    throw new Error("Unable to create Ramadan season.");
  }

  return result;
}

/* =====================================================
   GET FASTING DAYS
===================================================== */

export async function getFastingDays(
  userId: string,
  seasonId: string
): Promise<FastingDayRecord[]> {
  const snapshot = await getDocs(
    fastingDaysCollection(userId, seasonId)
  );

  return snapshot.docs
    .map((item) => {
      const data = item.data();

      if (
        data.status !== "completed" &&
        data.status !== "missed" &&
        data.status !== "exempt"
      ) {
        return null;
      }

      return {
        dayNumber: Number(data.dayNumber),
        date: String(data.date),
        status: data.status as FastingStatus,
        note:
          typeof data.note === "string"
            ? data.note
            : "",
        updatedAt: toMillis(data.updatedAt),
      };
    })
    .filter(
      (item): item is FastingDayRecord =>
        item !== null
    )
    .sort(
      (a, b) => a.dayNumber - b.dayNumber
    );
}

/* =====================================================
   SAVE FASTING DAY
===================================================== */

export async function saveFastingDay(
  userId: string,
  season: RamadanSeason,
  dayNumber: number,
  status: FastingStatus,
  note: string = ""
): Promise<void> {
  if (
    !Number.isInteger(dayNumber) ||
    dayNumber < 1 ||
    dayNumber > season.totalDays
  ) {
    throw new Error("Invalid Ramadan day.");
  }

  if (
    !["completed", "missed", "exempt"].includes(status)
  ) {
    throw new Error("Invalid fasting status.");
  }

  if (note.length > 500) {
    throw new Error("Note cannot exceed 500 characters.");
  }

  await setDoc(
    fastingDayDocument(
      userId,
      season.id,
      dayNumber
    ),
    {
      dayNumber,
      date: getRamadanDayDate(
        season.startDate,
        dayNumber
      ),
      status,
      note: note.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/* =====================================================
   CLEAR A FASTING DAY
===================================================== */

export async function clearFastingDay(
  userId: string,
  seasonId: string,
  dayNumber: number
): Promise<void> {
  await deleteDoc(
    fastingDayDocument(
      userId,
      seasonId,
      dayNumber
    )
  );
}

/* =====================================================
   UPDATE RAMADAN SEASON
===================================================== */

export async function updateRamadanSeason(
  userId: string,
  currentSeasonId: string,
  updates: UpdateRamadanSeasonInput
): Promise<RamadanSeason> {
  const { hijriYear, startDate, totalDays } = updates;

  if (
    !Number.isInteger(hijriYear) ||
    hijriYear < 1300 ||
    hijriYear > 1600
  ) {
    throw new Error("Enter a valid Hijri year.");
  }

  if (totalDays !== 29 && totalDays !== 30) {
    throw new Error("Ramadan must have 29 or 30 days.");
  }

  validateStartDate(startDate);

  const newSeasonId = String(hijriYear);

  const currentRef = seasonDocument(
    userId,
    currentSeasonId
  );

  const newRef = seasonDocument(
    userId,
    newSeasonId
  );

  // Check whether the current season exists.
  const currentSnapshot = await getDoc(currentRef);

  if (!currentSnapshot.exists()) {
    throw new Error(
      "The selected Ramadan season no longer exists."
    );
  }

  const currentData = currentSnapshot.data();

  // Prevent changing to an already existing Hijri year.
  if (currentSeasonId !== newSeasonId) {
    const targetSnapshot = await getDoc(newRef);

    if (targetSnapshot.exists()) {
      throw new Error(
        `Ramadan ${hijriYear} AH already exists. Choose another year.`
      );
    }
  }

  // Fetch all fasting records.
  const daysSnapshot = await getDocs(
    fastingDaysCollection(userId, currentSeasonId)
  );

  // Prevent losing Day 30 when shortening the season.
  const invalidDay = daysSnapshot.docs.find((dayDoc) => {
    const dayNumber = Number(dayDoc.data().dayNumber);

    return (
      !Number.isInteger(dayNumber) ||
      dayNumber < 1 ||
      dayNumber > totalDays
    );
  });

  if (invalidDay) {
    throw new Error(
      "This change would exclude a recorded fasting day. Clear that day first, or keep the season at 30 days."
    );
  }

  // Prepare the updated season.
  const updatedSeasonData = {
    ...currentData,
    hijriYear,
    startDate,
    totalDays,
    updatedAt: serverTimestamp(),
  };

  // Batch all document changes.
  const batch = writeBatch(db);

  if (currentSeasonId === newSeasonId) {
    // Same Hijri year: update the existing season.
    batch.set(currentRef, updatedSeasonData);
  } else {
    // Different Hijri year: move the season to a new document.
    batch.set(newRef, updatedSeasonData);
    batch.delete(currentRef);
  }

  // Preserve fasting records and update their Gregorian dates.
  for (const dayDoc of daysSnapshot.docs) {
    const dayData = dayDoc.data();
    const dayNumber = Number(dayData.dayNumber);

    const updatedDayData = {
      ...dayData,
      date: getRamadanDayDate(
        startDate,
        dayNumber
      ),
      updatedAt: serverTimestamp(),
    };

    if (currentSeasonId === newSeasonId) {
      // Same year: update existing fasting document.
      batch.set(dayDoc.ref, updatedDayData);
    } else {
      // Different year: create the record under the new season.
      const newDayRef = doc(
        db,
        "users",
        userId,
        "ramadanSeasons",
        newSeasonId,
        "fastingDays",
        dayDoc.id
      );

      batch.set(newDayRef, updatedDayData);

      // Remove the old fasting document.
      batch.delete(dayDoc.ref);
    }
  }

  // Commit all changes together.
  await batch.commit();

  return {
    id: newSeasonId,
    hijriYear,
    startDate,
    totalDays,
    createdAt: toMillis(currentData.createdAt),
    updatedAt: Date.now(),
  };
}

/* =====================================================
   DELETE RAMADAN SEASON
===================================================== */

export async function deleteRamadanSeason(
  userId: string,
  seasonId: string
): Promise<void> {
  const seasonRef = seasonDocument(
    userId,
    seasonId
  );

  // Confirm the season exists.
  const seasonSnapshot = await getDoc(seasonRef);

  if (!seasonSnapshot.exists()) {
    throw new Error(
      "This Ramadan season no longer exists."
    );
  }

  // Fetch all fasting-day records.
  const daysSnapshot = await getDocs(
    fastingDaysCollection(userId, seasonId)
  );

  // Delete the fasting records and season together.
  const batch = writeBatch(db);

  for (const dayDoc of daysSnapshot.docs) {
    batch.delete(dayDoc.ref);
  }

  batch.delete(seasonRef);

  await batch.commit();
}