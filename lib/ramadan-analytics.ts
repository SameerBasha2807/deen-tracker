
import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface RamadanAnalytics {
  fasting: {
    seasons: number;
    completed: number;
    missed: number;
    exempt: number;
    totalLogged: number;
  };

  qada: {
    obligations: number;
    required: number;
    completed: number;
    remaining: number;
    completionRecords: number;
  };

  quran: {
    goals: number;
    readings: number;
    pagesRead: number;
    completedJuz: number;
  };

  planner: {
    daysPlanned: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };

  charity: {
    donations: number;
    totalAmount: number;
    categories: {
      name: string;
      amount: number;
    }[];
  };

  lastTenNights: {
    nightsTracked: number;
    oddNightsTracked: number;
    activitiesCompleted: number;
  };
}

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getUserCollection(userId: string, name: string) {
  return collection(db, "users", userId, name);
}

export async function getRamadanAnalytics(
  userId: string
): Promise<RamadanAnalytics> {
  if (!userId) {
    throw new Error("User is not authenticated.");
  }

  // Fetch all existing Ramadan module collections.
  const [
    seasonsSnapshot,
    qadaObligationsSnapshot,
    qadaCompletionsSnapshot,
    khatamGoalsSnapshot,
    khatamReadingsSnapshot,
    plannerDaysSnapshot,
    plannerTasksSnapshot,
    charitySnapshot,
    lastTenSnapshot,
  ] = await Promise.all([
    getDocs(getUserCollection(userId, "ramadanSeasons")),
    getDocs(getUserCollection(userId, "qadaObligations")),
    getDocs(getUserCollection(userId, "qadaCompletions")),
    getDocs(getUserCollection(userId, "quranKhatams")),
    getDocs(getUserCollection(userId, "quranKhatamReadings")),
    getDocs(getUserCollection(userId, "ramadanPlannerDays")),
    getDocs(getUserCollection(userId, "ramadanPlannerTasks")),
    getDocs(getUserCollection(userId, "ramadanCharityDonations")),
    getDocs(getUserCollection(userId, "ramadanLastTenNights")),
  ]);

  // -------------------------------------------------------
  // FASTING
  // -------------------------------------------------------

  const fastingSnapshots = await Promise.all(
    seasonsSnapshot.docs.map((season) =>
      getDocs(
        collection(
          db,
          "users",
          userId,
          "ramadanSeasons",
          season.id,
          "fastingDays"
        )
      )
    )
  );

  let fastingCompleted = 0;
  let fastingMissed = 0;
  let fastingExempt = 0;

  fastingSnapshots.forEach((snapshot) => {
    snapshot.docs.forEach((day) => {
      const status = day.data().status;

      if (status === "completed") fastingCompleted++;
      else if (status === "missed") fastingMissed++;
      else if (status === "exempt") fastingExempt++;
    });
  });

  const totalFastingLogged =
    fastingCompleted + fastingMissed + fastingExempt;

  // -------------------------------------------------------
  // QADA FASTING
  // -------------------------------------------------------

  let qadaRequired = 0;
  let qadaCompleted = 0;

  qadaObligationsSnapshot.docs.forEach((item) => {
    const data = item.data();

    qadaRequired += toNumber(data.totalDays);
    qadaCompleted += toNumber(data.completedDays);
  });

  qadaCompleted = Math.min(qadaCompleted, qadaRequired);

  // -------------------------------------------------------
  // QURAN KHATAM
  // -------------------------------------------------------

  let quranPagesRead = 0;
  const completedJuzSet = new Set<number>();

  khatamReadingsSnapshot.docs.forEach((item) => {
    quranPagesRead += toNumber(item.data().pagesRead);
  });

  khatamGoalsSnapshot.docs.forEach((item) => {
    const completedJuz = item.data().completedJuz;

    if (Array.isArray(completedJuz)) {
      completedJuz.forEach((value) => {
        const juz = Number(value);

        if (
          Number.isInteger(juz) &&
          juz >= 1 &&
          juz <= 30
        ) {
          completedJuzSet.add(juz);
        }
      });
    }
  });

  // -------------------------------------------------------
  // DAILY RAMADAN PLANNER
  // -------------------------------------------------------

  let totalPlannerTasks = 0;
  let completedPlannerTasks = 0;

  plannerTasksSnapshot.docs.forEach((task) => {
    totalPlannerTasks++;

    if (task.data().completed === true) {
      completedPlannerTasks++;
    }
  });

  // -------------------------------------------------------
  // CHARITY
  // -------------------------------------------------------

  let totalCharityAmount = 0;

  const charityCategories = new Map<string, number>();

  charitySnapshot.docs.forEach((donation) => {
    const data = donation.data();

    const amount = toNumber(data.amount);
    const category = String(data.donationType || "other");

    totalCharityAmount += amount;

    charityCategories.set(
      category,
      (charityCategories.get(category) || 0) + amount
    );
  });

  const categoryResults = Array.from(
    charityCategories.entries()
  )
    .map(([name, amount]) => ({
      name,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  // -------------------------------------------------------
  // LAST 10 NIGHTS
  // -------------------------------------------------------

  let activitiesCompleted = 0;
  let oddNightsTracked = 0;

  lastTenSnapshot.docs.forEach((night) => {
    const data = night.data();
    const nightNumber = toNumber(data.nightNumber);

    const activities = Array.isArray(data.completedActivities)
      ? data.completedActivities
      : [];

    activitiesCompleted += activities.length;

    const hasRecord =
      activities.length > 0 ||
      (typeof data.duaAndReflection === "string" &&
        data.duaAndReflection.trim().length > 0);

    if (hasRecord && nightNumber % 2 !== 0) {
      oddNightsTracked++;
    }
  });

  return {
    fasting: {
      seasons: seasonsSnapshot.size,
      completed: fastingCompleted,
      missed: fastingMissed,
      exempt: fastingExempt,
      totalLogged: totalFastingLogged,
    },

    qada: {
      obligations: qadaObligationsSnapshot.size,
      required: qadaRequired,
      completed: qadaCompleted,
      remaining: Math.max(0, qadaRequired - qadaCompleted),
      completionRecords: qadaCompletionsSnapshot.size,
    },

    quran: {
      goals: khatamGoalsSnapshot.size,
      readings: khatamReadingsSnapshot.size,
      pagesRead: quranPagesRead,
      completedJuz: completedJuzSet.size,
    },

    planner: {
      daysPlanned: plannerDaysSnapshot.size,
      totalTasks: totalPlannerTasks,
      completedTasks: completedPlannerTasks,
      pendingTasks: totalPlannerTasks - completedPlannerTasks,
    },

    charity: {
      donations: charitySnapshot.size,
      totalAmount: totalCharityAmount,
      categories: categoryResults,
    },

    lastTenNights: {
      nightsTracked: lastTenSnapshot.size,
      oddNightsTracked,
      activitiesCompleted,
    },
  };
}
