
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   TYPES
===================================================== */

export type WuduValue =
  | "in_wudu"
  | "not_in_wudu";

export interface WuduStatusRecord {
  status: WuduValue;
  lastChangedAt: number | null;
  lastWuduAt: number | null;
  lastConfirmedAt: number | null;
}

/* =====================================================
   DOCUMENT REFERENCE
===================================================== */

function wuduDocument(userId: string) {
  return doc(
    db,
    "users",
    userId,
    "wudu",
    "current"
  );
}

/* =====================================================
   TIMESTAMP HELPER
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

/* =====================================================
   GET WUDU STATUS
===================================================== */

export async function getWuduStatus(
  userId: string
): Promise<WuduStatusRecord | null> {
  const snapshot = await getDoc(
    wuduDocument(userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  if (
    data.status !== "in_wudu" &&
    data.status !== "not_in_wudu"
  ) {
    return null;
  }

  return {
    status: data.status,

    lastChangedAt: toMillis(
      data.lastChangedAt
    ),

    lastWuduAt: toMillis(
      data.lastWuduAt
    ),

    lastConfirmedAt: toMillis(
      data.lastConfirmedAt
    ),
  };
}

/* =====================================================
   SAVE / CONFIRM WUDU STATUS
===================================================== */

export async function saveWuduStatus(
  userId: string,
  status: WuduValue
): Promise<WuduStatusRecord> {
  const wuduRef = wuduDocument(userId);

  await runTransaction(
    db,
    async (transaction) => {
      const snapshot = await transaction.get(
        wuduRef
      );

      const previousStatus =
        snapshot.exists()
          ? snapshot.data().status
          : null;

      const isNewStatus =
        previousStatus !== status;

      const update: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
        lastConfirmedAt: serverTimestamp(),
      };

      /*
       * Record when the status changes.
       */
      if (isNewStatus) {
        update.lastChangedAt =
          serverTimestamp();
      }

      /*
       * Record the time Wudu was newly marked.
       *
       * Confirming an existing Wudu status
       * does not reset this timestamp.
       */
      if (
        status === "in_wudu" &&
        previousStatus !== "in_wudu"
      ) {
        update.lastWuduAt =
          serverTimestamp();
      }

      transaction.set(
        wuduRef,
        update,
        { merge: true }
      );
    }
  );

  const updatedStatus =
    await getWuduStatus(userId);

  if (!updatedStatus) {
    throw new Error(
      "Could not retrieve the updated Wudu status."
    );
  }

  return updatedStatus;
}
