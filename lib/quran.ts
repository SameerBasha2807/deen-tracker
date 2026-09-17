import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =========================================================
   DAILY QURAN READING
========================================================= */

export interface DailyQuranLog {
  date: string;
  pagesRead: number;
  updatedAt: number;
}

export interface QuranSettings {
  dailyGoal: number;
}

function quranDocument(
  userId: string,
  date: string
) {
  return doc(
    db,
    "users",
    userId,
    "quran",
    date
  );
}

function quranSettingsDocument(
  userId: string
) {
  return doc(
    db,
    "users",
    userId,
    "quran",
    "settings"
  );
}

export async function getDailyQuranLog(
  userId: string,
  date: string
): Promise<DailyQuranLog> {
  const snapshot = await getDoc(
    quranDocument(userId, date)
  );

  if (!snapshot.exists()) {
    return {
      date,
      pagesRead: 0,
      updatedAt: Date.now(),
    };
  }

  const data = snapshot.data();

  return {
    date,
    pagesRead:
      typeof data.pagesRead === "number"
        ? data.pagesRead
        : 0,
    updatedAt:
      typeof data.updatedAt === "number"
        ? data.updatedAt
        : Date.now(),
  };
}

export async function saveDailyQuranPages(
  userId: string,
  date: string,
  pagesRead: number
) {
  await setDoc(
    quranDocument(userId, date),
    {
      date,
      pagesRead,
      updatedAt: Date.now(),
    },
    {
      merge: true,
    }
  );
}

export async function getQuranSettings(
  userId: string
): Promise<QuranSettings> {
  const snapshot = await getDoc(
    quranSettingsDocument(userId)
  );

  if (!snapshot.exists()) {
    return {
      dailyGoal: 5,
    };
  }

  const data = snapshot.data();

  return {
    dailyGoal:
      typeof data.dailyGoal === "number" &&
      data.dailyGoal > 0
        ? data.dailyGoal
        : 5,
  };
}

export async function saveQuranDailyGoal(
  userId: string,
  dailyGoal: number
) {
  await setDoc(
    quranSettingsDocument(userId),
    {
      dailyGoal,
      updatedAt: Date.now(),
    },
    {
      merge: true,
    }
  );
}

/* =========================================================
   QURAN / DHIKR TEMPLATES
========================================================= */

export type QuranTemplateType =
  | "surah"
  | "dhikr";

export interface QuranTemplate {
  id: string;
  name: string;
  type: QuranTemplateType;

  /*
   * Used when type === "surah"
   */
  surahName?: string;

  /*
   * Used when type === "dhikr"
   */
  dhikrName?: string;
  count?: number;

  createdAt: number;
  updatedAt: number;
}

/*
 * We keep templates inside the user's account.
 *
 * users/{userId}/quranTemplates/{templateId}
 */
function quranTemplatesCollection(
  userId: string
) {
  return collection(
    db,
    "users",
    userId,
    "quranTemplates"
  );
}

function quranTemplateDocument(
  userId: string,
  templateId: string
) {
  return doc(
    db,
    "users",
    userId,
    "quranTemplates",
    templateId
  );
}

/*
 * Daily completion:
 *
 * users/{userId}/quranTemplateCompletions/{date}_{templateId}
 */
function quranTemplateCompletionDocument(
  userId: string,
  date: string,
  templateId: string
) {
  return doc(
    db,
    "users",
    userId,
    "quranTemplateCompletions",
    `${date}_${templateId}`
  );
}

/* =========================================================
   GET TEMPLATES
========================================================= */

export async function getQuranTemplates(
  userId: string
): Promise<QuranTemplate[]> {
  const snapshot = await getDocs(
    quranTemplatesCollection(userId)
  );

  return snapshot.docs.map((item): QuranTemplate => {
    const data = item.data();

    const type: QuranTemplateType =
      data.type === "dhikr"
        ? "dhikr"
        : "surah";

    return {
      id: item.id,

      name:
        typeof data.name === "string"
          ? data.name
          : "",

      type,

      surahName:
        typeof data.surahName === "string"
          ? data.surahName
          : undefined,

      dhikrName:
        typeof data.dhikrName === "string"
          ? data.dhikrName
          : undefined,

      count:
        typeof data.count === "number"
          ? data.count
          : undefined,

      createdAt:
        typeof data.createdAt === "number"
          ? data.createdAt
          : 0,

      updatedAt:
        typeof data.updatedAt === "number"
          ? data.updatedAt
          : 0,
    };
  }).sort(
    (a, b) =>
      a.createdAt - b.createdAt
  );
}

/* =========================================================
   ADD GENERIC TEMPLATE
========================================================= */

export async function addQuranTemplate(
  userId: string,
  name: string,
  type: QuranTemplateType,
  content: string,
  count?: number
): Promise<QuranTemplate> {
  const templateRef = doc(
    quranTemplatesCollection(userId)
  );

  const now = Date.now();

  const trimmedName =
    name.trim();

  const trimmedContent =
    content.trim();

  if (!trimmedName) {
    throw new Error(
      "Routine name is required."
    );
  }

  if (!trimmedContent) {
    throw new Error(
      "Content is required."
    );
  }

  if (
    type === "dhikr" &&
    (!Number.isInteger(count) ||
      !count ||
      count <= 0)
  ) {
    throw new Error(
      "Dhikr count must be greater than zero."
    );
  }

  const template: QuranTemplate =
    type === "surah"
      ? {
          id: templateRef.id,
          name: trimmedName,
          type: "surah",
          surahName: trimmedContent,
          createdAt: now,
          updatedAt: now,
        }
      : {
          id: templateRef.id,
          name: trimmedName,
          type: "dhikr",
          dhikrName: trimmedContent,
          count,
          createdAt: now,
          updatedAt: now,
        };

  await setDoc(
    templateRef,
    template
  );

  return template;
}

/* =========================================================
   DELETE TEMPLATE
========================================================= */

export async function deleteQuranTemplate(
  userId: string,
  templateId: string
) {
  await deleteDoc(
    quranTemplateDocument(
      userId,
      templateId
    )
  );
}

/* =========================================================
   GET TODAY'S COMPLETION
========================================================= */

export async function getQuranTemplateCompletion(
  userId: string,
  date: string,
  templateId: string
): Promise<boolean> {
  const snapshot = await getDoc(
    quranTemplateCompletionDocument(
      userId,
      date,
      templateId
    )
  );

  if (!snapshot.exists()) {
    return false;
  }

  const data = snapshot.data();

  return data.completed === true;
}

/* =========================================================
   SAVE TODAY'S COMPLETION
========================================================= */

export async function saveQuranTemplateCompletion(
  userId: string,
  date: string,
  templateId: string,
  completed: boolean
) {
  await setDoc(
    quranTemplateCompletionDocument(
      userId,
      date,
      templateId
    ),
    {
      userId,
      date,
      templateId,
      completed,
      updatedAt: Date.now(),
    },
    {
      merge: true,
    }
  );
}



//Sameer
/* =========================================================
   QURAN READING STATISTICS
========================================================= */

export interface QuranReadingStats {
  currentStreak: number;
  longestStreak: number;
  daysThisWeek: number;
  totalPages: number;
}

function dateToKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function keyToDate(key: string) {
  const [year, month, day] =
    key.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

export async function getQuranReadingStats(
  userId: string
): Promise<QuranReadingStats> {



  /*
   * This function is intentionally not used here.
   *
   * Quran reading logs live in:
   *
   * users/{userId}/quran/{date}
   *
   * So we fetch that collection directly below.
   */

  const quranLogsCollection =
    collection(
      db,
      "users",
      userId,
      "quran"
    );

  const logsSnapshot =
    await getDocs(
      quranLogsCollection
    );

  const readingDays =
    new Map<string, number>();

  logsSnapshot.docs.forEach(
    (item) => {
      const id = item.id;

      /*
       * Ignore the settings document.
       *
       * Only documents with YYYY-MM-DD
       * are daily Quran records.
       */
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          id
        )
      ) {
        return;
      }

      const data = item.data();

      const pages =
        typeof data.pagesRead ===
        "number"
          ? data.pagesRead
          : 0;

      if (pages > 0) {
        readingDays.set(
          id,
          pages
        );
      }
    }
  );

  const today =
    new Date();

  const todayKey =
    dateToKey(today);

  /*
   * Total pages
   */

  let totalPages = 0;

  readingDays.forEach(
    (pages) => {
      totalPages += pages;
    }
  );

  /*
   * This week's reading days
   *
   * Week starts Monday.
   */

  const dayOfWeek =
    today.getDay();

  const daysFromMonday =
    dayOfWeek === 0
      ? 6
      : dayOfWeek - 1;

  const monday =
    new Date(today);

  monday.setDate(
    today.getDate() -
      daysFromMonday
  );

  monday.setHours(
    0,
    0,
    0,
    0
  );

  let daysThisWeek = 0;

  for (
    let i = 0;
    i < 7;
    i++
  ) {
    const date =
      new Date(monday);

    date.setDate(
      monday.getDate() + i
    );

    const key =
      dateToKey(date);

    if (
      readingDays.has(key)
    ) {
      daysThisWeek++;
    }
  }

  /*
   * Current streak
   *
   * If today has not been read yet,
   * start checking from yesterday.
   */

  let currentStreak = 0;

  const currentDate =
    new Date(today);

  if (
    !readingDays.has(
      todayKey
    )
  ) {
    currentDate.setDate(
      currentDate.getDate() - 1
    );
  }

  while (true) {
    const key =
      dateToKey(
        currentDate
      );

    if (
      !readingDays.has(key)
    ) {
      break;
    }

    currentStreak++;

    currentDate.setDate(
      currentDate.getDate() - 1
    );
  }

  /*
   * Longest streak
   */

  const sortedDates =
    Array.from(
      readingDays.keys()
    ).sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate:
    | Date
    | null = null;

  for (
    const key of sortedDates
  ) {
    const currentDate =
      keyToDate(key);

    if (!previousDate) {
      runningStreak = 1;
    } else {
      const difference =
        Math.round(
          (
            currentDate.getTime() -
            previousDate.getTime()
          ) /
            (1000 *
              60 *
              60 *
              24)
        );

      if (
        difference === 1
      ) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }

    longestStreak =
      Math.max(
        longestStreak,
        runningStreak
      );

    previousDate =
      currentDate;
  }

  return {
    currentStreak,
    longestStreak,
    daysThisWeek,
    totalPages,
  };
}

/* =========================================================
   MONTHLY QURAN READING ACTIVITY
========================================================= */

export interface QuranMonthReading {
  date: string;
  pagesRead: number;
}

export async function getQuranMonthReading(
  userId: string,
  year: number,
  month: number
): Promise<QuranMonthReading[]> {
  const quranLogsCollection = collection(
    db,
    "users",
    userId,
    "quran"
  );

  const snapshot = await getDocs(
    quranLogsCollection
  );

  const monthPrefix = `${year}-${String(
    month
  ).padStart(2, "0")}-`;

  return snapshot.docs
    .filter((item) => {
      // Ignore "settings"
      return item.id.startsWith(monthPrefix);
    })
    .map((item) => {
      const data = item.data();

      return {
        date: item.id,
        pagesRead:
          typeof data.pagesRead === "number"
            ? data.pagesRead
            : 0,
      };
    })
    .filter((item) => item.pagesRead > 0);
}
/* =========================================================
   READING STREAK
========================================================= */

export async function getQuranReadingStreak(
  userId: string
): Promise<number> {
  const snapshot = await getDocs(
    collection(
      db,
      "users",
      userId,
      "quran"
    )
  );

  const readingDates = snapshot.docs
    .map((item) => {
      const data = item.data();

      if (
        typeof data.date !== "string" ||
        typeof data.pagesRead !== "number" ||
        data.pagesRead <= 0
      ) {
        return null;
      }

      return data.date;
    })
    .filter(
      (date): date is string =>
        date !== null
    );

  const uniqueDates = Array.from(
    new Set(readingDates)
  ).sort((a, b) =>
    b.localeCompare(a)
  );

  if (uniqueDates.length === 0) {
    return 0;
  }

  const today = todayLocalDateForQuran();

  // If the user has not read today,
  // the current streak is broken.
  if (uniqueDates[0] !== today) {
    return 0;
  }

  let streak = 1;

  for (
    let i = 1;
    i < uniqueDates.length;
    i++
  ) {
    const previousDate = new Date(
      `${uniqueDates[i - 1]}T00:00:00`
    );

    const currentDate = new Date(
      `${uniqueDates[i]}T00:00:00`
    );

    const difference =
      Math.round(
        (previousDate.getTime() -
          currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (difference !== 1) {
      break;
    }

    streak++;
  }

  return streak;
}

function todayLocalDateForQuran(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}