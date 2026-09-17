"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Users,
  UserPlus,
  Trophy,
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { getGroup } from "@/lib/groups";

export default function GroupPage() {
  const params = useParams();

  // Your folder is [group_id], so the parameter is group_id
  const groupId = params.group_id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [group, setGroup] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(user.uid);

        try {
          setLoading(true);
          setError("");

          const groupData = await getGroup(groupId);

          if (!groupData) {
            setError("Group not found.");
            return;
          }

          setGroup(groupData);
        } catch (error) {
          console.error("Failed to load group:", error);
          setError("Unable to load this group.");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading group...
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030712] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Login Required
          </h1>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className="min-h-screen bg-[#030712] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">
            {error || "Group not found"}
          </h1>

          <Link
            href="/groups"
            className="mt-6 inline-flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = group.ownerId === userId;

  return (
    <main className="min-h-screen bg-[#030712] px-6 pb-20 pt-28 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/groups"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Groups
        </Link>

        {/* Group Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Users className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  {group.name}
                </h1>

                {group.description && (
                  <p className="mt-2 text-slate-400">
                    {group.description}
                  </p>
                )}
              </div>

            </div>

            {isOwner && (
              <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
                Group Owner
              </span>
            )}

          </div>

        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">

          {/* Invite */}
          <button
            type="button"
            className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-left transition hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <UserPlus className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Invite People
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Invite people you know using their
              DeenTracker username.
            </p>
          </button>

          {/* Group Leaderboard */}
          <button
            type="button"
            className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-left transition hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
              <Trophy className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Group Leaderboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Compare your Deen progress with
              members of this private group.
            </p>
          </button>

        </div>

        {/* Group Information */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-500" />

            <div>
              <h2 className="text-xl font-semibold">
                Group Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Details about this private group
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Group ID
              </p>

              <p className="mt-1 break-all text-sm text-slate-300">
                {group.id}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Owner
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {group.ownerId === userId
                  ? "You"
                  : group.ownerName || group.ownerId}
              </p>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}