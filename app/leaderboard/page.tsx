"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Trophy,
  Medal,
  Crown,
  Loader2,
  RefreshCw,
  Home,
} from "lucide-react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getLeaderboardUsers } from "@/lib/leaderboard";
import type { LeaderboardUser } from "@/lib/types";

export default function LeaderboardPage() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Check Firebase authentication.
   *
   * Firestore leaderboard rules require
   * the user to be authenticated.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setAuthUser(currentUser);
        setAuthLoading(false);

        if (!currentUser) {
          router.push("/login");
        }
      }
    );

    return unsubscribe;
  }, [router]);

  /*
   * Load leaderboard after authentication
   * has been confirmed.
   */
  async function loadLeaderboard() {
    if (!authUser) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const leaderboard =
        await getLeaderboardUsers(100);

      setUsers(leaderboard);
    } catch (error) {
      console.error(
        "Leaderboard loading error:",
        error
      );

      setError(
        "Unable to load the leaderboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && authUser) {
      loadLeaderboard();
    }
  }, [authLoading, authUser]);

  /*
   * Authentication loading screen.
   */
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#030712] text-white">
        <LeaderboardTopBar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />

            Checking your account...
          </div>
        </div>
      </main>
    );
  }

  /*
   * If user is not authenticated,
   * redirect is already being handled above.
   */
  if (!authUser) {
    return (
      <main className="min-h-screen bg-[#030712] text-white">
        <LeaderboardTopBar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-slate-400">
            Redirecting to login...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* =================================================
          LEADERBOARD TOPBAR
      ================================================= */}
      <LeaderboardTopBar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <div className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-10 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Trophy className="h-8 w-8" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Leaderboard
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Stay consistent, build your Deen, and
              see your progress alongside the community.
            </p>
          </div>

          {/* Refresh */}
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={loading}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-800
                bg-slate-900
                px-4
                py-2
                text-sm
                font-medium
                text-slate-300
                transition
                hover:border-emerald-500/40
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />

                Loading leaderboard...
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            users.length === 0 && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">

                <Trophy className="mx-auto h-10 w-10 text-slate-600" />

                <h2 className="mt-4 text-xl font-semibold">
                  No leaderboard data yet
                </h2>

                <p className="mt-2 text-slate-400">
                  Start tracking your Deen to appear here.
                </p>

              </div>
            )}

          {/* Leaderboard */}
          {!loading && users.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/20">

              {/* Table Header */}
              <div className="grid grid-cols-[70px_1fr_120px] border-b border-slate-800 px-6 py-4 text-sm font-medium text-slate-500">

                <span>Rank</span>

                <span>User</span>

                <span className="text-right">
                  Points
                </span>

              </div>

              {/* Users */}
              {users.map((user, index) => {
                const rank = index + 1;

                return (
                  <div
                    key={user.uid}
                    className="
                      grid
                      grid-cols-[70px_1fr_120px]
                      items-center
                      border-b
                      border-slate-800/70
                      px-6
                      py-5
                      transition
                      hover:bg-slate-800/30
                      last:border-b-0
                    "
                  >

                    {/* Rank */}
                    <div>
                      {rank === 1 ? (
                        <Crown className="h-6 w-6 text-yellow-400" />
                      ) : rank === 2 ? (
                        <Medal className="h-6 w-6 text-slate-300" />
                      ) : rank === 3 ? (
                        <Medal className="h-6 w-6 text-orange-400" />
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* User */}
                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-400">
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-white">
                          {user.name}
                        </p>

                        <p className="truncate text-sm text-slate-500">
                          @{user.username}
                        </p>

                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">

                      <p className="text-lg font-bold text-emerald-400">
                        {user.points}
                      </p>

                      <p className="text-xs text-slate-500">
                        points
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </main>
  );
}

/* =====================================================
   LEADERBOARD TOPBAR

   Only:
   - DeenTracker → Home
   - Home button → Home
===================================================== */

function LeaderboardTopBar() {
  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
        border-b
        border-slate-800
        bg-[#020914]/95
        backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* DeenTracker Logo */}
        <Link
          href="/"
          className="
            text-2xl
            font-bold
            tracking-tight
            text-emerald-400
            transition
            hover:text-emerald-300
          "
        >
          DeenTracker
        </Link>

        {/* ONLY Home */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-800
            bg-slate-900/70
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-300
            transition
            hover:border-emerald-500/40
            hover:bg-slate-800
            hover:text-white
          "
        >
          <Home className="h-4 w-4" />

          Home
        </Link>

      </div>
    </header>
  );
}