import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;

  points?: number;
  prayerPoints?: number;
  quranPoints?: number;
  charityPoints?: number;
}

/**
 * Get a user's profile using their Firebase UID.
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const snapshot = await getDoc(
    doc(db, "users", userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

/**
 * Find a user using their unique username.
 */
export async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const normalizedUsername =
    username.trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  const usernameSnapshot = await getDoc(
    doc(
      db,
      "usernames",
      normalizedUsername
    )
  );

  if (!usernameSnapshot.exists()) {
    return null;
  }

  const data = usernameSnapshot.data();

  if (!data.userId) {
    return null;
  }

  return getUserProfile(data.userId);
}