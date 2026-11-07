
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   TYPES
===================================================== */

export type RamadanPlannerCategory =
  | "suhoor"
  | "prayer"
  | "quran"
  | "dhikr"
  | "work"
  | "rest"
  | "iftar"
  | "taraweeh"
  | "charity"
  | "other";

export interface RamadanPlannerDay {
  date: string;
  intention: string;
  notes: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface RamadanPlannerTask {
  id: string;
  date: string;
  title: string;
  category: RamadanPlannerCategory;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface RamadanPlannerTaskInput {
  title: string;
  category: RamadanPlannerCategory;
  startTime: string;
  endTime: string;
  description: string;
}

export interface RamadanPlannerData {
  day: RamadanPlannerDay | null;
  tasks: RamadanPlannerTask[];
}

/* =====================================================
   COLLECTION REFERENCES

   users/{uid}/ramadanPlannerDays/{date}

   users/{uid}/ramadanPlannerTasks/{taskId}
===================================================== */

function daysCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "ramadanPlannerDays"
  );
}

function tasksCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "ramadanPlannerTasks"
  );
}

function dayDocument(userId: string, date: string) {
  return doc(
    db,
    "users",
    userId,
    "ramadanPlannerDays",
    date
  );
}

function taskDocument(
  userId: string,
  taskId: string
) {
  return doc(
    db,
    "users",
    userId,
    "ramadanPlannerTasks",
    taskId
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

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const key = [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");

  return key === date;
}

function isValidTime(time: string): boolean {
  return (
    time === "" ||
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  );
}

const allowedCategories: RamadanPlannerCategory[] = [
  "suhoor",
  "prayer",
  "quran",
  "dhikr",
  "work",
  "rest",
  "iftar",
  "taraweeh",
  "charity",
  "other",
];

function validateTask(
  input: RamadanPlannerTaskInput
): RamadanPlannerTaskInput {
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title || title.length > 100) {
    throw new Error(
      "Task title must be between 1 and 100 characters."
    );
  }

  if (!allowedCategories.includes(input.category)) {
    throw new Error("Invalid task category.");
  }

  if (
    !isValidTime(input.startTime) ||
    !isValidTime(input.endTime)
  ) {
    throw new Error("Enter a valid time.");
  }

  if (description.length > 500) {
    throw new Error(
      "Description cannot exceed 500 characters."
    );
  }

  return {
    ...input,
    title,
    description,
  };
}

/* =====================================================
   MAP DOCUMENTS
===================================================== */

function mapDay(
  date: string,
  data: Record<string, unknown>
): RamadanPlannerDay {
  return {
    date,
    intention:
      typeof data.intention === "string"
        ? data.intention
        : "",
    notes:
      typeof data.notes === "string"
        ? data.notes
        : "",
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function mapTask(
  id: string,
  data: Record<string, unknown>
): RamadanPlannerTask {
  const category = allowedCategories.includes(
    data.category as RamadanPlannerCategory
  )
    ? (data.category as RamadanPlannerCategory)
    : "other";

  return {
    id,
    date: String(data.date ?? ""),
    title: String(data.title ?? ""),
    category,
    startTime: String(data.startTime ?? ""),
    endTime: String(data.endTime ?? ""),
    description: String(data.description ?? ""),
    completed: data.completed === true,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/* =====================================================
   GET ONE DAY AND ITS TASKS
===================================================== */

export async function getRamadanPlannerData(
  userId: string,
  date: string
): Promise<RamadanPlannerData> {
  if (!isValidDate(date)) {
    throw new Error("Invalid planner date.");
  }

  const [daySnapshot, tasksSnapshot] = await Promise.all([
    getDoc(dayDocument(userId, date)),
    getDocs(
      query(
        tasksCollection(userId),
        where("date", "==", date)
      )
    ),
  ]);

  const day = daySnapshot.exists()
    ? mapDay(date, daySnapshot.data())
    : null;

  const tasks = tasksSnapshot.docs
    .map((item) => mapTask(item.id, item.data()))
    .sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;

      return a.startTime.localeCompare(b.startTime);
    });

  return { day, tasks };
}

/* =====================================================
   SAVE DAILY INTENTION AND NOTES
===================================================== */

export async function saveRamadanPlannerDay(
  userId: string,
  date: string,
  intention: string,
  notes: string
): Promise<void> {
  if (!isValidDate(date)) {
    throw new Error("Invalid planner date.");
  }

  const cleanIntention = intention.trim();
  const cleanNotes = notes.trim();

  if (cleanIntention.length > 300) {
    throw new Error(
      "Daily intention cannot exceed 300 characters."
    );
  }

  if (cleanNotes.length > 2000) {
    throw new Error(
      "Daily notes cannot exceed 2000 characters."
    );
  }

  const ref = dayDocument(userId, date);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    await updateDoc(ref, {
      intention: cleanIntention,
      notes: cleanNotes,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date,
      intention: cleanIntention,
      notes: cleanNotes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/* =====================================================
   ADD TASK
===================================================== */

export async function addRamadanPlannerTask(
  userId: string,
  date: string,
  input: RamadanPlannerTaskInput
): Promise<string> {
  if (!isValidDate(date)) {
    throw new Error("Invalid planner date.");
  }

  const valid = validateTask(input);

  const result = await addDoc(
    tasksCollection(userId),
    {
      date,
      ...valid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return result.id;
}

/* =====================================================
   UPDATE TASK
===================================================== */

export async function updateRamadanPlannerTask(
  userId: string,
  taskId: string,
  input: RamadanPlannerTaskInput
): Promise<void> {
  const valid = validateTask(input);
  const ref = taskDocument(userId, taskId);

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Planner task no longer exists.");
  }

  await updateDoc(ref, {
    ...valid,
    updatedAt: serverTimestamp(),
  });
}

/* =====================================================
   TOGGLE TASK COMPLETION
===================================================== */

export async function toggleRamadanPlannerTask(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  await updateDoc(
    taskDocument(userId, taskId),
    {
      completed,
      updatedAt: serverTimestamp(),
    }
  );
}

/* =====================================================
   DELETE TASK
===================================================== */

export async function deleteRamadanPlannerTask(
  userId: string,
  taskId: string
): Promise<void> {
  const ref = taskDocument(userId, taskId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Planner task no longer exists.");
  }

  await deleteDoc(ref);
}
