
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  MoonStar,
  Save,
  Sparkles,
  Star,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import { useAuth } from "@/contexts/AuthContext";

import {
  getRamadanLastTenNightsData,
  LAST_TEN_NIGHT_ACTIVITIES,
  RAMADAN_LAST_TEN_NIGHTS,
  saveLastTenNightLog,
  saveLastTenNightsSettings,
  type LastTenNightActivityId,
  type LastTenNightNumber,
  type LastTenNightLog,
} from "@/lib/ramadan-last-ten-nights";

function addDays(dateString: string, days: number) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "Date not set";

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function isOddNight(night: number) {
  return night % 2 !== 0;
}

function completedCount(log?: LastTenNightLog) {
  return log?.completedActivities.length ?? 0;
}

export default function LastTenNightsPage() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingNight, setSavingNight] = useState(false);

  const [night21StartDate, setNight21StartDate] = useState("");
  const [selectedNight, setSelectedNight] =
    useState<LastTenNightNumber>(21);

  const [logs, setLogs] = useState<
    Partial<Record<LastTenNightNumber, LastTenNightLog>>
  >({});

  const [completedActivities, setCompletedActivities] = useState<
    LastTenNightActivityId[]
  >([]);

  const [duaAndReflection, setDuaAndReflection] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("Please sign in to access your Last 10 Nights Tracker.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getRamadanLastTenNightsData(user!.uid);

        if (cancelled) return;

        setNight21StartDate(
          data.settings?.night21StartDate ?? ""
        );
        setLogs(data.logs);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your night records."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const selectedDate = useMemo(() => {
    if (!night21StartDate) return "";

    return addDays(
      night21StartDate,
      selectedNight - 21
    );
  }, [night21StartDate, selectedNight]);

  useEffect(() => {
    const existing = logs[selectedNight];

    setCompletedActivities(existing?.completedActivities ?? []);
    setDuaAndReflection(existing?.duaAndReflection ?? "");
  }, [selectedNight, logs]);

  const trackedNights = useMemo(
    () =>
      RAMADAN_LAST_TEN_NIGHTS.filter((night) => {
        const log = logs[night];

        return (
          !!log &&
          (log.completedActivities.length > 0 ||
            log.duaAndReflection.trim().length > 0)
        );
      }).length,
    [logs]
  );

  const totalActivities = useMemo(
    () =>
      RAMADAN_LAST_TEN_NIGHTS.reduce(
        (sum, night) => sum + completedCount(logs[night]),
        0
      ),
    [logs]
  );

  const oddNightsTracked = useMemo(
    () =>
      RAMADAN_LAST_TEN_NIGHTS.filter((night) => {
        const log = logs[night];

        return (
          isOddNight(night) &&
          !!log &&
          (log.completedActivities.length > 0 ||
            log.duaAndReflection.trim().length > 0)
        );
      }).length,
    [logs]
  );

  function toggleActivity(activity: LastTenNightActivityId) {
    setCompletedActivities((current) =>
      current.includes(activity)
        ? current.filter((item) => item !== activity)
        : [...current, activity]
    );
  }

  async function handleSaveSettings() {
    if (!user) return;

    try {
      setSavingSettings(true);
      setError("");
      setNotice("");

      await saveLastTenNightsSettings(
        user.uid,
        night21StartDate
      );

      setNotice("Your Ramadan night dates have been saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the date settings."
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveNight() {
    if (!user) return;

    try {
      setSavingNight(true);
      setError("");
      setNotice("");

      await saveLastTenNightLog(user.uid, selectedNight, {
        gregorianDate: selectedDate,
        completedActivities,
        duaAndReflection,
      });

      setLogs((current) => ({
        ...current,
        [selectedNight]: {
          id: `night_${selectedNight}`,
          nightNumber: selectedNight,
          gregorianDate: selectedDate,
          completedActivities: [...completedActivities],
          duaAndReflection,
        },
      }));

      setNotice(`Night ${selectedNight} record saved.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save this night's record."
      );
    } finally {
      setSavingNight(false);
    }
  }

  const selectedLog = logs[selectedNight];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                RAMADAN WORKSPACE
              </p>

              <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                <MoonStar className="text-emerald-700" size={30} />
                Last 10 Nights
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep track of your worship, duas and reflections
                throughout the final ten nights of Ramadan.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Sparkles size={17} />
                Seek Laylatul Qadr
              </div>
              <p className="mt-1 text-xs text-amber-800">
                Give attention to all ten nights.
              </p>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <CalendarDays size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-900">
                  Set your Ramadan calendar
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Select the Gregorian date on which the 21st
                  night begins. The dates for nights 22–30 will
                  be calculated from this date.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="w-full space-y-2 sm:max-w-xs">
                    <span className="text-sm font-medium text-slate-700">
                      Start date of the 21st night
                    </span>
                    <input
                      type="date"
                      value={night21StartDate}
                      onChange={(event) => {
                        setNight21StartDate(event.target.value);
                        setNotice("");
                      }}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings || !night21StartDate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingSettings ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Save dates
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Nights tracked
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {trackedNights}
                <span className="ml-1 text-base font-medium text-slate-400">
                  / 10
                </span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${trackedNights * 10}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Activities completed
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalActivities}
                <span className="ml-1 text-base font-medium text-slate-400">
                  / 80
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Across the ten nights
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-sm text-amber-800">
                Odd nights tracked
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-950">
                {oddNightsTracked}
                <span className="ml-1 text-base font-medium text-amber-700">
                  / 5
                </span>
              </p>
              <p className="mt-2 text-xs text-amber-800">
                21, 23, 25, 27 and 29
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Choose a night
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select any night to view or update its record.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {RAMADAN_LAST_TEN_NIGHTS.map((night) => {
                const isSelected = selectedNight === night;
                const odd = isOddNight(night);
                const log = logs[night];
                const tracked =
                  !!log &&
                  (log.completedActivities.length > 0 ||
                    log.duaAndReflection.trim().length > 0);

                return (
                  <button
                    type="button"
                    key={night}
                    onClick={() => {
                      setSelectedNight(night);
                      setError("");
                      setNotice("");
                    }}
                    className={`relative rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-100"
                        : odd
                          ? "border-amber-200 bg-amber-50/60 hover:border-amber-400"
                          : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Night
                      </span>
                      {tracked ? (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-700"
                        />
                      ) : odd ? (
                        <Star
                          size={16}
                          className="text-amber-600"
                        />
                      ) : null}
                    </div>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {night}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {odd ? "Odd night" : "Even night"}
                    </p>

                    {night21StartDate && (
                      <p className="mt-2 text-xs text-slate-600">
                        {formatDate(
                          addDays(night21StartDate, night - 21)
                        )}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Night {selectedNight}
                  </h2>

                  {isOddNight(selectedNight) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      <Star size={13} />
                      Odd night
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : "Set your calendar date above to display the Gregorian date."}
                </p>
              </div>

              <span className="text-sm font-medium text-emerald-700">
                {completedActivities.length} / 8 activities
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={20} />
                Loading your records...
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900">
                      Worship checklist
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Mark the activities you completed during this night.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {LAST_TEN_NIGHT_ACTIVITIES.map((activity) => {
                      const checked = completedActivities.includes(
                        activity.id
                      );

                      return (
                        <label
                          key={activity.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                            checked
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 hover:border-emerald-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleActivity(activity.id)
                            }
                            className="sr-only"
                          />

                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              checked
                                ? "border-emerald-700 bg-emerald-700 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {checked && <Check size={14} />}
                          </span>

                          <span className="min-w-0">
                            <span
                              className={`block text-sm font-semibold ${
                                checked
                                  ? "text-emerald-900"
                                  : "text-slate-800"
                              }`}
                            >
                              {activity.label}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              {activity.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-7">
                  <label className="block space-y-2">
                    <span className="font-semibold text-slate-900">
                      Personal duas and reflections
                    </span>
                    <span className="block text-sm text-slate-500">
                      Write down duas, personal reflections or
                      reminders for this night.
                    </span>
                    <textarea
                      rows={5}
                      maxLength={2000}
                      value={duaAndReflection}
                      onChange={(event) =>
                        setDuaAndReflection(event.target.value)
                      }
                      placeholder="Write your duas and reflections here..."
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {duaAndReflection.length} / 2000
                  </p>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    {selectedLog
                      ? "You have a saved record for this night."
                      : "Your changes have not been saved yet."}
                  </p>

                  <button
                    type="button"
                    onClick={handleSaveNight}
                    disabled={savingNight}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingNight ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {savingNight ? "Saving..." : "Save night record"}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Sparkles
                size={22}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div>
                <h2 className="font-semibold text-amber-950">
                  A reminder for the final ten nights
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  The tracker is intended to help you stay mindful
                  and organized. The checklist is personal, not a
                  measure of the value or acceptance of your worship.
                  Keep making dua and seeking Allah's mercy throughout
                  these nights.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
