import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { LeaderboardUser } from "@/lib/types";

export async function getLeaderboardUsers(): Promise<
  LeaderboardUser[]
> {
  const leaderboardCollection = collection(
    db,
    "leaderboard"
  );

  const snapshot = await getDocs(
    leaderboardCollection
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

  // Sort by total points, highest first.
  users.sort((a, b) => b.points - a.points);

  return users;
}
