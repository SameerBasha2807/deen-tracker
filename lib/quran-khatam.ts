
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   CONSTANTS AND TYPES
===================================================== */

export const QURAN_KHATAM_TOTAL_PAGES = 604;

export type QuranKhatamCategory =
  | "personal"
  | "ramadan";

export interface QuranKhatamGoal {
  id: string;
  title: string;
  category: QuranKhatamCategory;
  startDate: string;
  targetDate: string | null;
  targetPages: number;
  pagesRead: number;
  completedJuz: number[];
  createdAt: number | null;
  updatedAt: number | null;
}

export interface QuranKhatamReading {
  id: string;
  khatamId: string;
  date: string;
  pagesRead: number;
  surahName: string;
  ayahStart: number | null;
  ayahEnd: number | null;
  juzNumber: number | null;
  note: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface QuranKhatamData {
  goals: QuranKhatamGoal[];
  readings: QuranKhatamReading[];
}

export interface QuranKhatamGoalInput {
  title: string;
  category: QuranKhatamCategory;
  startDate: string;
  targetDate: string | null;
}

export interface QuranKhatamReadingInput {
  date: string;
  pagesRead: number;
  surahName: string;
  ayahStart: number | null;
  ayahEnd: number | null;
  juzNumber: number | null;
  note: string;
}

/* =====================================================
   COLLECTION REFERENCES

   users/{userId}/quranKhatams/{khatamId}

   users/{userId}/quranKhatamReadings/{readingId}
===================================================== */

function khatamsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "quranKhatams"
  );
}

function readingsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "quranKhatamReadings"
  );
}

function khatamDocument(
  userId: string,
  khatamId: string
) {
  return doc(
    db,
    "users",
    userId,
    "quranKhatams",
    khatamId
  );
}

function readingDocument(
  userId: string,
  readingId: string
) {
  return doc(
    db,
    "users",
    userId,
    "quranKhatamReadings",
    readingId
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

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const key = [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");

  return key === value;
}

function validateGoalInput(
  input: QuranKhatamGoalInput
): QuranKhatamGoalInput {
  const title = input.title.trim();

  if (!title || title.length > 100) {
    throw new Error(
      "Enter a title between 1 and 100 characters."
    );
  }

  if (
    input.category !== "personal" &&
    input.category !== "ramadan"
  ) {
    throw new Error("Invalid Khatam category.");
  }

  if (!isValidDate(input.startDate)) {
    throw new Error("Enter a valid start date.");
  }

  if (
    input.targetDate !== null &&
    (
      !isValidDate(input.targetDate) ||
      input.targetDate < input.startDate
    )
  ) {
    throw new Error(
      "Target date must be valid and cannot be before the start date."
    );
  }

  return {
    title,
    category: input.category,
    startDate: input.startDate,
    targetDate: input.targetDate,
  };
}

function validateReadingInput(
  input: QuranKhatamReadingInput
): QuranKhatamReadingInput {
  if (!isValidDate(input.date)) {
    throw new Error("Enter a valid reading date.");
  }

  if (
    !Number.isInteger(input.pagesRead) ||
    input.pagesRead < 1 ||
    input.pagesRead > QURAN_KHATAM_TOTAL_PAGES
  ) {
    throw new Error(
      "Pages read must be between 1 and 604."
    );
  }

  const surahName = input.surahName.trim();
  const note = input.note.trim();

  if (surahName.length > 100) {
    throw new Error(
      "Surah name cannot exceed 100 characters."
    );
  }

  if (note.length > 500) {
    throw new Error(
      "Reading note cannot exceed 500 characters."
    );
  }

  const hasAyahStart = input.ayahStart !== null;
  const hasAyahEnd = input.ayahEnd !== null;

  if (hasAyahStart !== hasAyahEnd) {
    throw new Error(
      "Enter both the starting and ending Ayah, or leave both empty."
    );
  }

  if (
    hasAyahStart &&
    hasAyahEnd &&
    (
      !Number.isInteger(input.ayahStart) ||
      !Number.isInteger(input.ayahEnd) ||
      input.ayahStart! < 1 ||
      input.ayahEnd! < input.ayahStart!
    )
  ) {
    throw new Error("Enter a valid Ayah range.");
  }

  if (
    input.juzNumber !== null &&
    (
      !Number.isInteger(input.juzNumber) ||
      input.juzNumber < 1 ||
      input.juzNumber > 30
    )
  ) {
    throw new Error("Juz must be between 1 and 30.");
  }

  return {
    ...input,
    surahName,
    note,
  };
}

/* =====================================================
   MAP DOCUMENTS
===================================================== */

function mapGoal(
  id: string,
  data: Record<string, unknown>
): QuranKhatamGoal {
  const completedJuz = Array.isArray(data.completedJuz)
    ? Array.from(
        new Set(
          data.completedJuz.filter(
            (value): value is number =>
              typeof value === "number" &&
              Number.isInteger(value) &&
              value >= 1 &&
              value <= 30
          )
        )
      ).sort((a, b) => a - b)
    : [];

  return {
    id,
    title: String(data.title ?? ""),
    category:
      data.category === "ramadan"
        ? "ramadan"
        : "personal",
    startDate: String(data.startDate ?? ""),
    targetDate:
      typeof data.targetDate === "string"
        ? data.targetDate
        : null,
    targetPages: QURAN_KHATAM_TOTAL_PAGES,
    pagesRead:
      typeof data.pagesRead === "number"
        ? data.pagesRead
        : 0,
    completedJuz,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function mapReading(
  id: string,
  data: Record<string, unknown>
): QuranKhatamReading {
  return {
    id,
    khatamId: String(data.khatamId ?? ""),
    date: String(data.date ?? ""),
    pagesRead:
      typeof data.pagesRead === "number"
        ? data.pagesRead
        : 0,
    surahName:
      typeof data.surahName === "string"
        ? data.surahName
        : "",
    ayahStart:
      typeof data.ayahStart === "number"
        ? data.ayahStart
        : null,
    ayahEnd:
      typeof data.ayahEnd === "number"
        ? data.ayahEnd
        : null,
    juzNumber:
      typeof data.juzNumber === "number"
        ? data.juzNumber
        : null,
    note:
      typeof data.note === "string"
        ? data.note
        : "",
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/* =====================================================
   GET ALL KHATAM GOALS AND READING RECORDS
===================================================== */

export async function getQuranKhatamData(
  userId: string
): Promise<QuranKhatamData> {
  const [goalsSnapshot, readingsSnapshot] =
    await Promise.all([
      getDocs(khatamsCollection(userId)),
      getDocs(readingsCollection(userId)),
    ]);

  const goals = goalsSnapshot.docs
    .map((item) =>
      mapGoal(item.id, item.data())
    )
    .sort((a, b) => {
      const aTime = a.createdAt ?? 0;
      const bTime = b.createdAt ?? 0;

      return bTime - aTime;
    });

  const readings = readingsSnapshot.docs
    .map((item) =>
      mapReading(item.id, item.data())
    )
    .sort((a, b) => {
      const dateOrder = b.date.localeCompare(a.date);

      if (dateOrder !== 0) {
        return dateOrder;
      }

      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

  return {
    goals,
    readings,
  };
}

/* =====================================================
   CREATE KHATAM GOAL
===================================================== */

export async function createQuranKhatam(
  userId: string,
  input: QuranKhatamGoalInput
): Promise<string> {
  const valid = validateGoalInput(input);

  const goalRef = doc(khatamsCollection(userId));

  await setDoc(goalRef, {
    ...valid,
    targetPages: QURAN_KHATAM_TOTAL_PAGES,
    pagesRead: 0,
    completedJuz: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return goalRef.id;
}

/* =====================================================
   UPDATE KHATAM GOAL
===================================================== */

export async function updateQuranKhatam(
  userId: string,
  khatamId: string,
  input: QuranKhatamGoalInput
): Promise<void> {
  const valid = validateGoalInput(input);

  const goalRef = khatamDocument(userId, khatamId);

  const snapshot = await getDoc(goalRef);

  if (!snapshot.exists()) {
    throw new Error("Khatam goal no longer exists.");
  }

  await updateDoc(goalRef, {
    ...valid,
    updatedAt: serverTimestamp(),
  });
}

/* =====================================================
   DELETE KHATAM GOAL AND ITS READING HISTORY
===================================================== */

export async function deleteQuranKhatam(
  userId: string,
  khatamId: string
): Promise<void> {
  const goalRef = khatamDocument(userId, khatamId);

  const goalSnapshot = await getDoc(goalRef);

  if (!goalSnapshot.exists()) {
    throw new Error("Khatam goal no longer exists.");
  }

  const readingsQuery = query(
    readingsCollection(userId),
    where("khatamId", "==", khatamId)
  );

  const readingsSnapshot = await getDocs(readingsQuery);

  // Firestore permits up to 500 writes per batch.
  // Use smaller batches to leave room for safe operation.
  const readings = readingsSnapshot.docs;

  for (let i = 0; i < readings.length; i += 450) {
    const batch = writeBatch(db);

    readings
      .slice(i, i + 450)
      .forEach((item) => {
        batch.delete(item.ref);
      });

    await batch.commit();
  }

  await deleteDoc(goalRef);
}

/* =====================================================
   ADD READING SESSION
===================================================== */

export async function addQuranKhatamReading(
  userId: string,
  khatamId: string,
  input: QuranKhatamReadingInput
): Promise<string> {
  const valid = validateReadingInput(input);

  const goalRef = khatamDocument(userId, khatamId);

  const readingRef = doc(
    readingsCollection(userId)
  );

  await runTransaction(db, async (transaction) => {
    const goalSnapshot = await transaction.get(goalRef);

    if (!goalSnapshot.exists()) {
      throw new Error("Khatam goal no longer exists.");
    }

    const goalData = goalSnapshot.data();

    const currentPages = Number(
      goalData.pagesRead ?? 0
    );

    const nextPages = currentPages + valid.pagesRead;

    if (nextPages > QURAN_KHATAM_TOTAL_PAGES) {
      throw new Error(
        `Only ${QURAN_KHATAM_TOTAL_PAGES - currentPages} pages remain in this Khatam.`
      );
    }

    transaction.update(goalRef, {
      pagesRead: nextPages,
      updatedAt: serverTimestamp(),
    });

    transaction.set(readingRef, {
      khatamId,
      ...valid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return readingRef.id;
}

/* =====================================================
   UPDATE READING SESSION
===================================================== */

export async function updateQuranKhatamReading(
  userId: string,
  readingId: string,
  input: QuranKhatamReadingInput
): Promise<void> {
  const valid = validateReadingInput(input);

  const readingRef = readingDocument(
    userId,
    readingId
  );

  await runTransaction(db, async (transaction) => {
    const readingSnapshot = await transaction.get(
      readingRef
    );

    if (!readingSnapshot.exists()) {
      throw new Error("Reading record no longer exists.");
    }

    const readingData = readingSnapshot.data();

    const khatamId = String(readingData.khatamId);

    const goalRef = khatamDocument(
      userId,
      khatamId
    );

    const goalSnapshot = await transaction.get(goalRef);

    if (!goalSnapshot.exists()) {
      throw new Error("Associated Khatam goal no longer exists.");
    }

    const currentPages = Number(
      goalSnapshot.data().pagesRead ?? 0
    );

    const oldPages = Number(
      readingData.pagesRead ?? 0
    );

    const nextPages =
      currentPages - oldPages + valid.pagesRead;

    if (
      nextPages < 0 ||
      nextPages > QURAN_KHATAM_TOTAL_PAGES
    ) {
      throw new Error(
        "The updated reading amount exceeds the remaining Khatam pages."
      );
    }

    transaction.update(goalRef, {
      pagesRead: nextPages,
      updatedAt: serverTimestamp(),
    });

    transaction.update(readingRef, {
      ...valid,
      updatedAt: serverTimestamp(),
    });
  });
}

/* =====================================================
   DELETE READING SESSION
===================================================== */

export async function deleteQuranKhatamReading(
  userId: string,
  readingId: string
): Promise<void> {
  const readingRef = readingDocument(
    userId,
    readingId
  );

  await runTransaction(db, async (transaction) => {
    const readingSnapshot = await transaction.get(
      readingRef
    );

    if (!readingSnapshot.exists()) {
      return;
    }

    const readingData = readingSnapshot.data();

    const khatamId = String(readingData.khatamId);

    const goalRef = khatamDocument(
      userId,
      khatamId
    );

    const goalSnapshot = await transaction.get(goalRef);

    const oldPages = Number(
      readingData.pagesRead ?? 0
    );

    // Delete the reading record.
    transaction.delete(readingRef);

    // Update the parent goal's page count.
    if (goalSnapshot.exists()) {
      const currentPages = Number(
        goalSnapshot.data().pagesRead ?? 0
      );

      transaction.update(goalRef, {
        pagesRead: Math.max(0, currentPages - oldPages),
        updatedAt: serverTimestamp(),
      });
    }
  });
}

/* =====================================================
   MARK / UNMARK A JUZ AS COMPLETED
===================================================== */

export async function setQuranKhatamJuzCompleted(
  userId: string,
  khatamId: string,
  juzNumber: number,
  completed: boolean
): Promise<void> {
  if (
    !Number.isInteger(juzNumber) ||
    juzNumber < 1 ||
    juzNumber > 30
  ) {
    throw new Error("Juz must be between 1 and 30.");
  }

  const goalRef = khatamDocument(userId, khatamId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(goalRef);

    if (!snapshot.exists()) {
      throw new Error("Khatam goal no longer exists.");
    }

    const rawJuz = snapshot.data().completedJuz;

    const currentJuz: number[] = Array.isArray(rawJuz)
      ? rawJuz.filter(
          (value): value is number =>
            typeof value === "number" &&
            Number.isInteger(value) &&
            value >= 1 &&
            value <= 30
        )
      : [];

    const nextJuz = new Set(currentJuz);

    if (completed) {
      nextJuz.add(juzNumber);
    } else {
      nextJuz.delete(juzNumber);
    }

    transaction.update(goalRef, {
      completedJuz: Array.from(nextJuz).sort(
        (a, b) => a - b
      ),
      updatedAt: serverTimestamp(),
    });
  });
}
