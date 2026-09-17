import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { CharityRecord } from "@/lib/types";

function charityCollection(userId: string) {
  return collection(db, "users", userId, "charity");
}

/**
 * Get only the current user's charity records.
 */
export async function getCharityRecords(
  userId: string
): Promise<CharityRecord[]> {
  const snapshot = await getDocs(
    query(
      charityCollection(userId),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map(
    (record) =>
      ({
        id: record.id,
        ...record.data(),
      }) as CharityRecord
  );
}

/**
 * Add a charity record.
 *
 * IMPORTANT:
 * Firestore does not allow undefined values.
 * Therefore note is only added when it has a value.
 */
export async function addCharityRecord(
  userId: string,
  record: Omit<CharityRecord, "id">
): Promise<CharityRecord> {
  const firestoreRecord: Omit<CharityRecord, "id"> = {
    userId: record.userId,
    amount: record.amount,
    date: record.date,
    category: record.category,
    createdAt: record.createdAt,
    ...(record.note?.trim()
      ? { note: record.note.trim() }
      : {}),
  };

  const document = await addDoc(
    charityCollection(userId),
    firestoreRecord
  );

  return {
    id: document.id,
    ...firestoreRecord,
  };
}

/**
 * Delete one charity record belonging to the current user.
 */
export async function deleteCharityRecord(
  userId: string,
  recordId: string
): Promise<void> {
  const recordRef = doc(
    db,
    "users",
    userId,
    "charity",
    recordId
  );

  await deleteDoc(recordRef);
}