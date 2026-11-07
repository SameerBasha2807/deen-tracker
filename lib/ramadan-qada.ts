
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   TYPES
===================================================== */

export interface QadaObligation {
  id: string;
  label: string;
  sourceHijriYear: number | null;
  totalDays: number;
  completedDays: number;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface QadaCompletion {
  id: string;
  obligationId: string;
  completedDate: string;
  note: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface QadaData {
  obligations: QadaObligation[];
  completions: QadaCompletion[];
}

export interface QadaObligationInput {
  label: string;
  sourceHijriYear: number | null;
  totalDays: number;
}

/* =====================================================
   COLLECTION REFERENCES
===================================================== */

function obligationsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "qadaObligations"
  );
}

function completionsCollection(userId: string) {
  return collection(
    db,
    "users",
    userId,
    "qadaCompletions"
  );
}

function obligationDocument(
  userId: string,
  obligationId: string
) {
  return doc(
    db,
    "users",
    userId,
    "qadaObligations",
    obligationId
  );
}

function completionDocument(
  userId: string,
  completionId: string
) {
  return doc(
    db,
    "users",
    userId,
    "qadaCompletions",
    completionId
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

function validateObligation(input: QadaObligationInput) {
  const label = input.label.trim();

  if (!label || label.length > 100) {
    throw new Error(
      "Enter a label between 1 and 100 characters."
    );
  }

  if (
    !Number.isInteger(input.totalDays) ||
    input.totalDays < 1 ||
    input.totalDays > 500
  ) {
    throw new Error(
      "Qada fasts must be between 1 and 500."
    );
  }

  if (
    input.sourceHijriYear !== null &&
    (
      !Number.isInteger(input.sourceHijriYear) ||
      input.sourceHijriYear < 1300 ||
      input.sourceHijriYear > 1600
    )
  ) {
    throw new Error("Enter a valid Hijri year.");
  }

  return {
    ...input,
    label,
  };
}

function validateCompletion(
  completedDate: string,
  note: string
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completedDate)) {
    throw new Error("Enter a valid completion date.");
  }

  const date = new Date(`${completedDate}T00:00:00`);

  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  if (
    Number.isNaN(date.getTime()) ||
    dateKey !== completedDate
  ) {
    throw new Error("Enter a valid completion date.");
  }

  if (note.length > 500) {
    throw new Error("Note cannot exceed 500 characters.");
  }

  return note.trim();
}

/* =====================================================
   MAP DOCUMENTS
===================================================== */

function mapObligation(
  id: string,
  data: Record<string, unknown>
): QadaObligation {
  return {
    id,
    label: String(data.label ?? ""),
    sourceHijriYear:
      typeof data.sourceHijriYear === "number"
        ? data.sourceHijriYear
        : null,
    totalDays: Number(data.totalDays ?? 0),
    completedDays: Number(data.completedDays ?? 0),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

function mapCompletion(
  id: string,
  data: Record<string, unknown>
): QadaCompletion {
  return {
    id,
    obligationId: String(data.obligationId ?? ""),
    completedDate: String(data.completedDate ?? ""),
    note: String(data.note ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/* =====================================================
   GET ALL QADA DATA
===================================================== */

export async function getQadaData(
  userId: string
): Promise<QadaData> {
  const [obligationsSnapshot, completionsSnapshot] =
    await Promise.all([
      getDocs(obligationsCollection(userId)),
      getDocs(completionsCollection(userId)),
    ]);

  const obligations = obligationsSnapshot.docs
    .map((item) =>
      mapObligation(item.id, item.data())
    )
    .sort((a, b) => b.totalDays - a.totalDays);

  const completions = completionsSnapshot.docs
    .map((item) =>
      mapCompletion(item.id, item.data())
    )
    .sort((a, b) =>
      b.completedDate.localeCompare(a.completedDate)
    );

  return {
    obligations,
    completions,
  };
}

/* =====================================================
   CREATE QADA OBLIGATION
===================================================== */

export async function createQadaObligation(
  userId: string,
  input: QadaObligationInput
): Promise<string> {
  const valid = validateObligation(input);

  const result = await addDoc(
    obligationsCollection(userId),
    {
      ...valid,
      completedDays: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return result.id;
}

/* =====================================================
   UPDATE QADA OBLIGATION
===================================================== */

export async function updateQadaObligation(
  userId: string,
  obligationId: string,
  input: QadaObligationInput
): Promise<void> {
  const valid = validateObligation(input);

  const ref = obligationDocument(
    userId,
    obligationId
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      throw new Error("Qada obligation no longer exists.");
    }

    const completedDays = Number(
      snapshot.data().completedDays ?? 0
    );

    if (valid.totalDays < completedDays) {
      throw new Error(
        `You have already completed ${completedDays} fasts. The total cannot be lower than that.`
      );
    }

    transaction.update(ref, {
      ...valid,
      updatedAt: serverTimestamp(),
    });
  });
}

/* =====================================================
   DELETE QADA OBLIGATION
   ALSO DELETES ASSOCIATED COMPLETIONS
===================================================== */

export async function deleteQadaObligation(
  userId: string,
  obligationId: string
): Promise<void> {
  const obligationRef = obligationDocument(
    userId,
    obligationId
  );

  const obligationSnapshot = await getDoc(obligationRef);

  if (!obligationSnapshot.exists()) {
    throw new Error("Qada obligation no longer exists.");
  }

  const completionQuery = query(
    completionsCollection(userId),
    where("obligationId", "==", obligationId)
  );

  const completionSnapshot = await getDocs(
    completionQuery
  );

  // Firestore allows a maximum of 500 writes per batch.
  // Delete in smaller batches to stay below that limit.
  const completionDocs = completionSnapshot.docs;

  for (let i = 0; i < completionDocs.length; i += 450) {
    const batch = writeBatch(db);

    completionDocs
      .slice(i, i + 450)
      .forEach((item) => batch.delete(item.ref));

    await batch.commit();
  }

  await deleteDoc(obligationRef);
}

/* =====================================================
   RECORD A COMPLETED QADA FAST
===================================================== */

export async function createQadaCompletion(
  userId: string,
  obligationId: string,
  completedDate: string,
  note: string = ""
): Promise<void> {
  const cleanNote = validateCompletion(
    completedDate,
    note
  );

  const obligationRef = obligationDocument(
    userId,
    obligationId
  );

  const completionRef = doc(
    completionsCollection(userId)
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(
      obligationRef
    );

    if (!snapshot.exists()) {
      throw new Error("Qada obligation no longer exists.");
    }

    const data = snapshot.data();

    const totalDays = Number(data.totalDays ?? 0);
    const completedDays = Number(
      data.completedDays ?? 0
    );

    if (completedDays >= totalDays) {
      throw new Error(
        "All fasts for this obligation have been completed."
      );
    }

    // Increase the completion count and save the record
    // in the same transaction.
    transaction.update(obligationRef, {
      completedDays: completedDays + 1,
      updatedAt: serverTimestamp(),
    });

    transaction.set(completionRef, {
      obligationId,
      completedDate,
      note: cleanNote,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

/* =====================================================
   UPDATE COMPLETION DATE / NOTE
===================================================== */

export async function updateQadaCompletion(
  userId: string,
  completionId: string,
  completedDate: string,
  note: string = ""
): Promise<void> {
  const cleanNote = validateCompletion(
    completedDate,
    note
  );

  await updateDoc(
    completionDocument(userId, completionId),
    {
      completedDate,
      note: cleanNote,
      updatedAt: serverTimestamp(),
    }
  );
}

/* =====================================================
   DELETE COMPLETED QADA FAST
   ALSO DECREASES COMPLETION COUNT
===================================================== */

export async function deleteQadaCompletion(
  userId: string,
  completionId: string
): Promise<void> {
  const completionRef = completionDocument(
    userId,
    completionId
  );

  await runTransaction(db, async (transaction) => {
    const completionSnapshot = await transaction.get(
      completionRef
    );

    if (!completionSnapshot.exists()) {
      return;
    }

    const completionData = completionSnapshot.data();

    const obligationRef = obligationDocument(
      userId,
      String(completionData.obligationId)
    );

    const obligationSnapshot = await transaction.get(
      obligationRef
    );

    // All reads have completed before writes.
    transaction.delete(completionRef);

    if (obligationSnapshot.exists()) {
      const completedDays = Number(
        obligationSnapshot.data().completedDays ?? 0
      );

      transaction.update(obligationRef, {
        completedDays: Math.max(0, completedDays - 1),
        updatedAt: serverTimestamp(),
      });
    }
  });
}
