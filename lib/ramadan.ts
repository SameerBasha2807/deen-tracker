import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =====================================================
   RAMADAN MODE DOCUMENT
===================================================== */

function ramadanDocument(userId: string) {
  return doc(
    db,
    "users",
    userId,
    "preferences",
    "ramadan"
  );
}

/* =====================================================
   GET RAMADAN MODE
===================================================== */

export async function getRamadanMode(
  userId: string
): Promise<boolean> {
  const snapshot = await getDoc(
    ramadanDocument(userId)
  );

  if (!snapshot.exists()) {
    return false;
  }

  return (
    snapshot.data().ramadanModeEnabled === true
  );
}

/* =====================================================
   SAVE RAMADAN MODE
===================================================== */

export async function saveRamadanMode(
  userId: string,
  enabled: boolean
): Promise<void> {
  await setDoc(
    ramadanDocument(userId),
    {
      ramadanModeEnabled: enabled,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}