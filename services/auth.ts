import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

/**
 * Normalize username so searching is consistent.
 *
 * Example:
 * Sameer_Basha -> sameer_basha
 * SameerBasha -> sameerbasha
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/**
 * Check whether a username is already registered.
 */
export async function isUsernameTaken(
  username: string
): Promise<boolean> {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return false;
  }

  const usernameRef = doc(
    db,
    "usernames",
    normalizedUsername
  );

  const snapshot = await getDoc(usernameRef);

  return snapshot.exists();
}

/**
 * Register a new user.
 *
 * Firebase Auth handles:
 * - email
 * - password
 *
 * Firestore handles:
 * - name
 * - username
 * - email
 */
export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  const cleanName = name.trim();
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Name is required.");
  }

  if (!cleanUsername) {
    throw new Error("Username is required.");
  }

  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    throw new Error(
      "Username can only contain letters, numbers and underscores."
    );
  }

  if (cleanUsername.length < 3) {
    throw new Error(
      "Username must contain at least 3 characters."
    );
  }

  if (cleanUsername.length > 20) {
    throw new Error(
      "Username must contain at most 20 characters."
    );
  }

  /*
   * Check username before creating the Firebase account.
   */
  const usernameRef = doc(
    db,
    "usernames",
    cleanUsername
  );

  const usernameSnapshot = await getDoc(usernameRef);

  if (usernameSnapshot.exists()) {
    const error = new Error(
      "Username already exists."
    );

    (
      error as Error & {
        code?: string;
      }
    ).code = "username-already-exists";

    throw error;
  }

  /*
   * Create Firebase Authentication account.
   */
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  const user = credential.user;

  /*
   * Set Firebase display name.
   */
  await updateProfile(user, {
    displayName: cleanName,
  });

  /*
   * Create user's main profile.
   */
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      createdAt: serverTimestamp(),

      /*
       * Leaderboard fields.
       */
      points: 0,
      prayerPoints: 0,
      quranPoints: 0,
      charityPoints: 0,
    }
  );

  /*
   * Reserve the username.
   *
   * Document ID is the normalized username.
   */
  await setDoc(usernameRef, {
    username: cleanUsername,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Login using email and password.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

  return credential.user;
}

/**
 * Logout.
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Password reset.
 */
export async function resetPassword(
  email: string
): Promise<void> {
  await sendPasswordResetEmail(
    auth,
    email.trim().toLowerCase()
  );
}