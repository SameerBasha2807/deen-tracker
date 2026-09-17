"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import {
  createGroup,
  getUserGroups,
  type Group,
} from "@/lib/groups";

export default function GroupsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setUserId(null);
          setGroups([]);
          setLoading(false);
          return;
        }

        setUserId(user.uid);

        try {
          const myGroups = await getUserGroups(
            user.uid
          );

          setGroups(myGroups);
        } catch (error) {
          console.error(
            "Failed to load groups:",
            error
          );

          setError(
            "Unable to load your groups."
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleCreateGroup(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      setError("Please login first.");
      return;
    }

    const cleanName = groupName.trim();

    if (!cleanName) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      /*
       * Get user's profile.
       */
      const userSnapshot = await getDoc(
        doc(db, "users", userId)
      );

      if (!userSnapshot.exists()) {
        throw new Error(
          "User profile not found."
        );
      }

      const userData = userSnapshot.data();

      const ownerName =
        typeof userData.name === "string"
          ? userData.name
          : auth.currentUser?.displayName || "User";

      const ownerUsername =
        typeof userData.username === "string"
          ? userData.username
          : "";

      /*
       * Create the group.
       */
      const newGroup = await createGroup(
        userId,
        ownerName,
        ownerUsername,
        cleanName
      );

      /*
       * Add the new group to the UI.
       */
      setGroups((previous) => [
        newGroup,
        ...previous,
      ]);

      setGroupName("");
      setShowCreate(false);
    } catch (error) {
      console.error(
        "Failed to create group:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create the group."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * Not logged in.
   */
  if (!loading && !userId) {
    return (
      <main className="min-h-screen bg-[#030712] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <Users className="mx-auto h-14 w-14 text-emerald-400" />

          <h1 className="mt-6 text-3xl font-bold">
            Login Required
          </h1>

          <p className="mt-3 text-slate-400">
            Please login to create and join groups.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030712] px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <button
            type="button"
            onClick={() =>
              setShowCreate(!showCreate)
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <Plus className="h-5 w-5" />
            Create Group
          </button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Users className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Your Groups
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Build consistency together with people
            you know. Create a private group and
            invite your friends.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Create Group */}
        {showCreate && (
          <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">
              Create a Group
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Give your group a name. You can invite
              people after creating it.
            </p>

            <form
              onSubmit={handleCreateGroup}
              className="mt-6 flex flex-col gap-4 sm:flex-row"
            >
              <input
                type="text"
                value={groupName}
                onChange={(event) =>
                  setGroupName(event.target.value)
                }
                placeholder="e.g. Family, Friends, Ramadan Squad"
                maxLength={50}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={creating}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your groups...
            </div>
          </div>
        )}

        {/* No Groups */}
        {!loading && groups.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Users className="h-8 w-8" />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              You don't have any groups yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              Create a private group and invite your
              friends to build consistency together.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowCreate(true)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              <Plus className="h-5 w-5" />
              Create Your First Group
            </button>
          </div>
        )}

        {/* Groups */}
        {!loading && groups.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Users className="h-7 w-7" />
                  </div>

                  <span className="text-sm text-slate-500 transition group-hover:text-emerald-400">
                    Open →
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold">
                  {group.name}
                </h2>

                <p className="mt-3 text-sm text-slate-400">
                  {group.description ||
                    "Private DeenTracker group"}
                </p>

                {group.ownerId === userId && (
                  <div className="mt-5 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Owner
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}