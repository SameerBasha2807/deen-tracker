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
      fardPrayerNames.map((name) => [
        name,
        false,
      ])
    ) as DailyPrayerLog["fard"],

    voluntary: Object.fromEntries(
      voluntaryPrayerNames.map((name) => [
        name,
        false,
      ])
    ) as DailyPrayerLog["voluntary"],

    updatedAt: Date.now(),
  };
}

function prayerDocument(
  userId: string,
  date: string
) {
  return doc(
    db,
    "users",
    userId,
    "prayers",
    date
  );
}

/**
 * Calculate the leaderboard points
 * earned from one day's prayer activity.
 *
 * Fard prayer       = 1 point each
 * Voluntary prayer  = 1 point each
 * All 5 Fard        = 1 bonus point
 */
function calculatePrayerPoints(
  log: DailyPrayerLog
): number {
  let points = 0;

  // Fard prayers
  for (const prayer of fardPrayerNames) {
    if (log.fard[prayer]) {
      points += 1;
    }
  }

  // Voluntary prayers
  for (const prayer of voluntaryPrayerNames) {
    if (log.voluntary[prayer]) {
      points += 1;
    }
  }

  // Bonus for completing all 5 Fard prayers
  const completedAllFard =
    fardPrayerNames.every(
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

  const fard = {
    ...empty.fard,
  };

  const voluntary = {
    ...empty.voluntary,
  };

  /*
   * Support flattened Firestore fields.
   */
  for (const prayer of fardPrayerNames) {
    const value =
      stored[`fard.${prayer}`];

    if (typeof value === "boolean") {
      fard[prayer] = value;
    }
  }

  for (const prayer of voluntaryPrayerNames) {
    const value =
      stored[`voluntary.${prayer}`];

    if (typeof value === "boolean") {
      voluntary[prayer] = value;
    }
  }

  /*
   * Support normal nested Firestore maps.
   */
  if (
    stored.fard &&
    typeof stored.fard === "object"
  ) {
    Object.assign(
      fard,
      stored.fard
    );
  }

  if (
    stored.voluntary &&
    typeof stored.voluntary === "object"
  ) {
    Object.assign(
      voluntary,
      stored.voluntary
    );
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
 * Save a prayer completion and update
 * the user's leaderboard points.
 */
export async function savePrayerCompletion(
  userId: string,
  date: string,
  prayer: TrackablePrayerName,
  completed: boolean
): Promise<void> {
  const prayerRef =
    prayerDocument(userId, date);

  const userRef = doc(
    db,
    "users",
    userId
  );

  await runTransaction(
    db,
    async (transaction) => {
      /*
       * Read the current prayer log.
       */
      const prayerSnapshot =
        await transaction.get(prayerRef);

      /*
       * Read the user's profile.
       */
      const userSnapshot =
        await transaction.get(userRef);

      /*
       * Start with an empty prayer log.
       */
      let currentLog =
        createEmptyPrayerLog(date);

      /*
       * If today's prayer log already exists,
       * reconstruct it.
       */
      if (prayerSnapshot.exists()) {
        const stored =
          prayerSnapshot.data();

        const fard = {
          ...currentLog.fard,
        };

        const voluntary = {
          ...currentLog.voluntary,
        };

        /*
         * Read nested Fard prayers.
         */
        if (
          stored.fard &&
          typeof stored.fard === "object"
        ) {
          Object.assign(
            fard,
            stored.fard
          );
        }

        /*
         * Read nested voluntary prayers.
         */
        if (
          stored.voluntary &&
          typeof stored.voluntary === "object"
        ) {
          Object.assign(
            voluntary,
            stored.voluntary
          );
        }

        /*
         * Also support the old flattened format.
         */
        for (const prayerName of fardPrayerNames) {
          const value =
            stored[`fard.${prayerName}`];

          if (typeof value === "boolean") {
            fard[prayerName] = value;
          }
        }

        for (const prayerName of voluntaryPrayerNames) {
          const value =
            stored[`voluntary.${prayerName}`];

          if (typeof value === "boolean") {
            voluntary[prayerName] = value;
          }
        }

        currentLog = {
          date,

          fard,

          voluntary,

          updatedAt:
            typeof stored.updatedAt ===
            "number"
              ? stored.updatedAt
              : Date.now(),
        };
      }

      /*
       * Calculate points BEFORE the change.
       */
      const previousPoints =
        calculatePrayerPoints(
          currentLog
        );

      /*
       * Create the updated prayer log.
       */
      const updatedLog: DailyPrayerLog = {
        date,

        fard: {
          ...currentLog.fard,
        },

        voluntary: {
          ...currentLog.voluntary,
        },

        updatedAt: Date.now(),
      };

      /*
       * Determine whether this is
       * a Fard or voluntary prayer.
       */
      const isFard =
        fardPrayerNames.includes(
          prayer as FardPrayerName
        );

      /*
       * Update the selected prayer.
       */
      if (isFard) {
        updatedLog.fard[
          prayer as FardPrayerName
        ] = completed;
      } else {
        updatedLog.voluntary[
          prayer as VoluntaryPrayerName
        ] = completed;
      }

      /*
       * Calculate points AFTER the change.
       */
      const newPoints =
        calculatePrayerPoints(
          updatedLog
        );

      /*
       * Only apply the difference.
       *
       * Example:
       *
       * 0 → 1 = +1
       * 1 → 1 =  0
       * 1 → 0 = -1
       *
       * This prevents duplicate points.
       */
      const pointDifference =
        newPoints - previousPoints;

      /*
       * Save prayer log.
       */
      transaction.set(
        prayerRef,
        {
          date,

          fard: updatedLog.fard,

          voluntary:
            updatedLog.voluntary,

          updatedAt:
            updatedLog.updatedAt,
        },
        {
          merge: true,
        }
      );

      /*
       * Update leaderboard totals.
       */
      if (userSnapshot.exists()) {
        const userData =
          userSnapshot.data();

        const currentPoints =
          typeof userData.points === "number"
            ? userData.points
            : 0;

        const currentPrayerPoints =
          typeof userData.prayerPoints ===
          "number"
            ? userData.prayerPoints
            : 0;

        transaction.update(
          userRef,
          {
            points: Math.max(
              0,
              currentPoints +
                pointDifference
            ),

            prayerPoints: Math.max(
              0,
              currentPrayerPoints +
                pointDifference
            ),
          }
        );
      }
    }
  );

  /*
   * Tell the currently open application
   * that prayer data has changed.
   */
  if (
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        "prayer-data-updated"
      )
    );
  }
}