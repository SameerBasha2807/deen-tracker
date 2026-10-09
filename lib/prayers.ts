import {
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  fardPrayerNames,
  voluntaryPrayerNames,
  type DailyPrayerLog,
  type FardPrayerName,
  type TrackablePrayerName,
  type VoluntaryPrayerName,
} from "@/lib/types";

export function createEmptyPrayerLog(
  date: string
): DailyPrayerLog {
  return {
    date,
    fard: Object.fromEntries(
      fardPrayerNames.map((name) => [name, false])
    ) as DailyPrayerLog["fard"],
    voluntary: Object.fromEntries(
      voluntaryPrayerNames.map((name) => [name, false])
    ) as DailyPrayerLog["voluntary"],
    updatedAt: Date.now(),
  };
}

function prayerDocument(
  userId: string,
  date: string
) {
  return doc(db, "users", userId, "prayers", date);
}

/**
 * Calculate points earned from one day's prayer activity.
 *
 * Fard prayer:       1 point each
 * Voluntary prayer:  1 point each
 * All 5 Fard:        1 bonus point
 */
function calculatePrayerPoints(
  log: DailyPrayerLog
): number {
  let points = 0;

  for (const prayer of fardPrayerNames) {
    if (log.fard[prayer]) {
      points += 1;
    }
  }

  for (const prayer of voluntaryPrayerNames) {
    if (log.voluntary[prayer]) {
      points += 1;
    }
  }

  const completedAllFard = fardPrayerNames.every(
    (prayer) => log.fard[prayer]
  );

  if (completedAllFard) {
    points += 1;
  }

  return points;
}

/**
 * Get a user's prayer log for a specific date.
 */
export async function getDailyPrayerLog(
  userId: string,
  date: string
): Promise<DailyPrayerLog> {
  const empty = createEmptyPrayerLog(date);

  const snapshot = await getDoc(
    prayerDocument(userId, date)
  );

  if (!snapshot.exists()) {
    return empty;
  }

  const stored = snapshot.data();

  const fard = { ...empty.fard };
  const voluntary = { ...empty.voluntary };

  // Support flattened Firestore fields.
  for (const prayer of fardPrayerNames) {
    const value = stored[`fard.${prayer}`];

    if (typeof value === "boolean") {
      fard[prayer] = value;
    }
  }

  for (const prayer of voluntaryPrayerNames) {
    const value = stored[`voluntary.${prayer}`];

    if (typeof value === "boolean") {
      voluntary[prayer] = value;
    }
  }

  // Support normal nested Firestore maps.
  if (
    stored.fard &&
    typeof stored.fard === "object"
  ) {
    Object.assign(fard, stored.fard);
  }

  if (
    stored.voluntary &&
    typeof stored.voluntary === "object"
  ) {
    Object.assign(voluntary, stored.voluntary);
  }

  return {
    date,
    fard,
    voluntary,
    updatedAt:
      typeof stored.updatedAt === "number"
        ? stored.updatedAt
        : Date.now(),
  };
}

/**
 * Save a prayer completion and synchronize leaderboard points.
 */
export async function savePrayerCompletion(
  userId: string,
  date: string,
  prayer: TrackablePrayerName,
  completed: boolean
): Promise<void> {
  const prayerRef = prayerDocument(userId, date);

  const userRef = doc(
    db,
    "users",
    userId
  );

  const leaderboardRef = doc(
    db,
    "leaderboard",
    userId
  );

  await runTransaction(db, async (transaction) => {
    // Read all documents before performing any writes.
    const prayerSnapshot =
      await transaction.get(prayerRef);

    const userSnapshot =
      await transaction.get(userRef);

    const leaderboardSnapshot =
      await transaction.get(leaderboardRef);

    // Reconstruct the current prayer log.
    let currentLog = createEmptyPrayerLog(date);

    if (prayerSnapshot.exists()) {
      const stored = prayerSnapshot.data();

      const fard = { ...currentLog.fard };
      const voluntary = { ...currentLog.voluntary };

      // Read nested Fard prayers.
      if (
        stored.fard &&
        typeof stored.fard === "object"
      ) {
        Object.assign(fard, stored.fard);
      }

      // Read nested voluntary prayers.
      if (
        stored.voluntary &&
        typeof stored.voluntary === "object"
      ) {
        Object.assign(voluntary, stored.voluntary);
      }

      // Support the old flattened format.
      for (const prayerName of fardPrayerNames) {
        const value = stored[`fard.${prayerName}`];

        if (typeof value === "boolean") {
          fard[prayerName] = value;
        }
      }

      for (const prayerName of voluntaryPrayerNames) {
        const value = stored[`voluntary.${prayerName}`];

        if (typeof value === "boolean") {
          voluntary[prayerName] = value;
        }
      }

      currentLog = {
        date,
        fard,
        voluntary,
        updatedAt:
          typeof stored.updatedAt === "number"
            ? stored.updatedAt
            : Date.now(),
      };
    }

    // Calculate points before the change.
    const previousPoints =
      calculatePrayerPoints(currentLog);

    // Create the updated prayer log.
    const updatedLog: DailyPrayerLog = {
      date,
      fard: { ...currentLog.fard },
      voluntary: { ...currentLog.voluntary },
      updatedAt: Date.now(),
    };

    // Update the selected prayer.
    const isFard = fardPrayerNames.includes(
      prayer as FardPrayerName
    );

    if (isFard) {
      updatedLog.fard[prayer as FardPrayerName] =
        completed;
    } else {
      updatedLog.voluntary[
        prayer as VoluntaryPrayerName
      ] = completed;
    }

    // Calculate points after the change.
    const newPoints =
      calculatePrayerPoints(updatedLog);

    // Apply only the difference to prevent duplicate points.
    const pointDifference =
      newPoints - previousPoints;

    // Save the prayer log.
    transaction.set(
      prayerRef,
      {
        date,
        fard: updatedLog.fard,
        voluntary: updatedLog.voluntary,
        updatedAt: updatedLog.updatedAt,
      },
      { merge: true }
    );

    // Synchronize the private profile and public leaderboard.
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      const currentProfilePoints =
        typeof userData.points === "number"
          ? userData.points
          : 0;

      const currentProfilePrayerPoints =
        typeof userData.prayerPoints === "number"
          ? userData.prayerPoints
          : 0;

      const nextProfilePoints = Math.max(
        0,
        currentProfilePoints + pointDifference
      );

      const nextProfilePrayerPoints = Math.max(
        0,
        currentProfilePrayerPoints + pointDifference
      );

      // Update the user's private profile.
      transaction.update(userRef, {
        points: nextProfilePoints,
        prayerPoints: nextProfilePrayerPoints,
      });

      // Use existing public totals when available.
      // For existing users without a leaderboard entry,
      // initialize from their profile totals.
      const leaderboardData =
        leaderboardSnapshot.exists()
          ? leaderboardSnapshot.data()
          : null;

      const leaderboardPoints =
        typeof leaderboardData?.points === "number"
          ? leaderboardData.points
          : currentProfilePoints;

      const leaderboardPrayerPoints =
        typeof leaderboardData?.prayerPoints === "number"
          ? leaderboardData.prayerPoints
          : currentProfilePrayerPoints;

      const nextLeaderboardPoints = Math.max(
        0,
        leaderboardPoints + pointDifference
      );

      const nextLeaderboardPrayerPoints = Math.max(
        0,
        leaderboardPrayerPoints + pointDifference
      );

      // Create or update the public-safe leaderboard document.
      transaction.set(leaderboardRef, {
        uid: userId,
        name:
          typeof userData.name === "string"
            ? userData.name
            : "",
        username:
          typeof userData.username === "string"
            ? userData.username
            : "",
        points: nextLeaderboardPoints,
        prayerPoints: nextLeaderboardPrayerPoints,
        quranPoints:
          typeof leaderboardData?.quranPoints === "number"
            ? leaderboardData.quranPoints
            : typeof userData.quranPoints === "number"
              ? userData.quranPoints
              : 0,
        charityPoints:
          typeof leaderboardData?.charityPoints === "number"
            ? leaderboardData.charityPoints
            : typeof userData.charityPoints === "number"
              ? userData.charityPoints
              : 0,
      });
    }
  });

  // Notify the currently open application that prayer data changed.
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("prayer-data-updated")
    );
  }
}