"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Circle, MoonStar } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  getDailyPrayerLog,
  savePrayerCompletion,
} from "@/lib/prayers";

import {
  fardPrayerNames,
  voluntaryPrayerNames,
  type DailyPrayerLog,
  type TrackablePrayerName,
} from "@/lib/types";

const labels: Record<TrackablePrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  sunnah: "Sunnah prayers",
  nafl: "Nafl prayer",
  witr: "Witr",
  tahajjud: "Tahajjud",
  ishraq: "Ishraq",
  tawbah: "Prayer of Tawbah",
};

const isFard = (
  prayer: TrackablePrayerName
): prayer is (typeof fardPrayerNames)[number] =>
  fardPrayerNames.includes(
    prayer as (typeof fardPrayerNames)[number]
  );

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export default function DailyPrayerTracker() {
  const { user, loading: authLoading } = useAuth();

  /*
   * IMPORTANT:
   * This must NOT be useMemo().
   *
   * The date needs to change automatically when midnight passes.
   */
  const [date, setDate] = useState(todayLocalDate());

  const [log, setLog] = useState<DailyPrayerLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] =
    useState<TrackablePrayerName | null>(null);
  const [error, setError] = useState<string | null>(null);

  /*
   * Detect a new day automatically.
   *
   * We check once every second. This means that when the local
   * date changes at 00:00, the tracker immediately switches to
   * the new date.
   *
   * Nothing from the previous day is deleted.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentDate = todayLocalDate();

      setDate((previousDate) => {
        if (previousDate !== currentDate) {
          return currentDate;
        }

        return previousDate;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Load the prayer record whenever:
   * - the user changes
   * - the date changes
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLog(null);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    void getDailyPrayerLog(user.uid, date)
      .then((record) => {
        if (active) {
          setLog(record);
        }
      })
      .catch((error) => {
        console.error(
          "Could not load today's prayer record:",
          error
        );

        if (active) {
          setError(
            "Could not load today’s prayer record."
          );
          setLog(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [date, user, authLoading]);

  async function togglePrayer(
    prayer: TrackablePrayerName
  ) {
    if (!user || !log || saving) {
      return;
    }

    const complete = isFard(prayer)
      ? log.fard[prayer]
      : log.voluntary[prayer];

    const next: DailyPrayerLog = isFard(prayer)
      ? {
          ...log,
          fard: {
            ...log.fard,
            [prayer]: !complete,
          },
        }
      : {
          ...log,
          voluntary: {
            ...log.voluntary,
            [prayer]: !complete,
          },
        };

    // Optimistic UI update
    setLog(next);
    setSaving(prayer);
    setError(null);

    try {
      await savePrayerCompletion(
        user.uid,
        date,
        prayer,
        !complete
      );
    } catch (error) {
      console.error(
        "Could not save prayer completion:",
        error
      );

      // Restore previous state if Firebase save fails
      setLog(log);

      setError(
        "Could not save this prayer. Please try again."
      );
    } finally {
      setSaving(null);
    }
  }

  if (authLoading || loading) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-[#07111F] p-8 text-slate-400">
        Loading today’s tracker…
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-[#07111F] p-8 text-center text-slate-300">
        Sign in to save your prayer records.

        <Link
          href="/auth"
          className="ml-2 font-semibold text-emerald-400"
        >
          Sign in
        </Link>
      </section>
    );
  }

  if (!log) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-[#07111F] p-8 text-center text-slate-400">
        Could not load today’s prayer tracker.
      </section>
    );
  }

  const completedFard = fardPrayerNames.filter(
    (name) => log.fard[name]
  ).length;

  const completedVoluntary =
    voluntaryPrayerNames.filter(
      (name) => log.voluntary[name]
    ).length;

  const groups: {
    title: string;
    prayers: readonly TrackablePrayerName[];
    summary: string;
  }[] = [
    {
      title: "Fard prayers",
      prayers: fardPrayerNames,
      summary: `${completedFard}/5 complete today`,
    },
    {
      title: "Sunnah & voluntary prayers",
      prayers: voluntaryPrayerNames,
      summary: `${completedVoluntary}/6 recorded today`,
    },
  ];

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-5 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            {date}
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Today’s Prayer Tracker
          </h1>

          <p className="mt-2 text-slate-400">
            Keep your record truthful and sincere.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-center">
          <p className="text-sm text-emerald-200">
            Completed today
          </p>

          <p className="text-3xl font-bold text-emerald-400">
            {completedFard + completedVoluntary}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </p>
      )}

      {/* Completion message */}
      {completedFard === 5 && (
        <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          Alhamdulillah—every fard prayer is complete today.
        </p>
      )}

      {/* Prayer groups */}
      <div className="mt-8 space-y-7">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="mb-3">
              <h2 className="font-semibold text-white">
                {group.title}
              </h2>

              <p className="text-sm text-slate-400">
                {group.summary}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.prayers.map((prayer) => {
                const complete = isFard(prayer)
                  ? log.fard[prayer]
                  : log.voluntary[prayer];

                return (
                  <button
                    key={prayer}
                    type="button"
                    onClick={() =>
                      void togglePrayer(prayer)
                    }
                    disabled={saving !== null}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                      complete
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-[#172235] bg-[#081522] hover:border-emerald-500/40"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl ${
                        complete
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {complete ? (
                        <Check size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </span>

                    <span>
                      <span className="block font-semibold text-white">
                        {labels[prayer]}
                      </span>

                      <span className="text-xs text-slate-400">
                        {complete
                          ? "Completed"
                          : saving === prayer
                          ? "Saving…"
                          : "Mark complete"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reminder */}
      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
        <MoonStar
          className="mt-0.5 shrink-0 text-amber-300"
          size={18}
        />

        <span>
          Record prayers sincerely for Allah—not merely
          for points or leaderboard rank.
        </span>
      </div>
    </section>
  );
}