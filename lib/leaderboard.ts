import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { LeaderboardUser } from "@/lib/types";

/**
 * Get all users that are eligible to appear
 * on the global leaderboard.
 *
 * IMPORTANT:
 * This version intentionally does not use
 * orderBy() or limit().
 *
 * We are first verifying that Firestore allows
 * authenticated users to read the users collection.
 */
export async function getLeaderboardUsers(): Promise<
  LeaderboardUser[]
> {
  console.log("🔥 Starting leaderboard query...");

  const usersCollection = collection(db, "users");

  console.log("🔥 Users collection created.");

  const snapshot = await getDocs(usersCollection);

  console.log(
    "🔥 Users successfully loaded:",
    snapshot.size
  );

  const users: LeaderboardUser[] = snapshot.docs.map(
    (document) => {
      const data = document.data();

      return {
        uid: document.id,

        username:
          typeof data.username === "string"
            ? data.username
            : "",

        name:
          typeof data.name === "string"
            ? data.name
            : "User",

        points:
          typeof data.points === "number"
            ? data.points
            : 0,

        prayerPoints:
          typeof data.prayerPoints === "number"
            ? data.prayerPoints
            : 0,

        quranPoints:
          typeof data.quranPoints === "number"
            ? data.quranPoints
            : 0,

        charityPoints:
          typeof data.charityPoints === "number"
            ? data.charityPoints
            : 0,
      };
    }
  );

  /*
   * Sort locally for this testing stage.
   *
   * Once Firestore permissions are confirmed,
   * we can move the sorting into the Firestore
   * query using orderBy().
   */
  users.sort((a, b) => b.points - a.points);

  return users;
}