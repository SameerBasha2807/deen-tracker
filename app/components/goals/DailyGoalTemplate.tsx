"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyGoalTemplate,
  saveDailyGoalTemplate,
  getDailyGoalRecord,
  getDailyGoalRecords,
  saveDailyGoalRecord,
  type DailyGoalActivity,
  type DailyGoalCategory,
  type DailyGoalRecord,
} from "@/lib/daily-goals";

import {
  fardPrayerNames,
  voluntaryPrayerNames,
  type TrackablePrayerName,
} from "@/lib/types";

import {
  getDailyPrayerLog,
  savePrayerCompletion,
} from "@/lib/prayers";

import {
  addQuranTemplate,
  getDailyQuranLog,
  getQuranTemplates,
  getQuranTemplateCompletion,
  saveDailyQuranPages,
  saveQuranTemplateCompletion,
} from "@/lib/quran";

const prayerLabels: Record<TrackablePrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  sunnah: "Sunnah",
  nafl: "Nafl",
  witr: "Witr",
  tahajjud: "Tahajjud",
  ishraq: "Ishraq",
  duha: "Salatul Duha",
  tawbah: "Salatul Tawbah",
};

const prayerOptions: TrackablePrayerName[] = [
  ...fardPrayerNames,
  ...voluntaryPrayerNames,
];

function getLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function createActivityId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getActivityIcon(category: DailyGoalCategory) {
  switch (category) {
    case "prayer":
      return Clock;
    case "quran":
    case "surah":
      return BookOpen;
    case "dhikr":
      return Sparkles;
    case "custom":
      return Activity;
  }
}

function heatmapColor(
  percentage: number | undefined,
  hasRecord: boolean
) {
  if (!hasRecord) return "#111D2D";
  if (percentage === 0) return "#29384B";
  if (percentage! <= 25) return "#36516D";
  if (percentage! <= 50) return "#326C83";
  if (percentage! <= 75) return "#298C87";
  return "#55C69A";
}

export default function DailyGoalTemplate() {
  const { user, loading: authLoading } = useAuth();

  const [templateActivities, setTemplateActivities] = useState<
    DailyGoalActivity[]
  >([]);

  const [activities, setActivities] = useState<
    DailyGoalActivity[]
  >([]);

  const [completed, setCompleted] = useState<
    Record<string, boolean>
  >({});

  const [pageCounts, setPageCounts] = useState<
    Record<string, string>
  >({});

  const [history, setHistory] = useState<DailyGoalRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    getLocalDate()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [builderOpen, setBuilderOpen] = useState(false);
  const [category, setCategory] =
    useState<DailyGoalCategory>("prayer");

  const [activityName, setActivityName] = useState("");
  const [prayerName, setPrayerName] =
    useState<TrackablePrayerName>("fajr");

  const [targetPages, setTargetPages] = useState("5");
  const [dhikrCount, setDhikrCount] = useState("33");

  const today = getLocalDate();
  const viewingToday = selectedDate === today;

  const completedCount = activities.filter(
    (item) => completed[item.id] === true
  ).length;

  const percentage =
    activities.length === 0
      ? 0
      : Math.round(
          (completedCount / activities.length) * 100
        );

  const heatmapDays = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());

    const days: string[] = [];
    const current = new Date(start);

    while (current <= end) {
      days.push(getLocalDate(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, []);

  const historyByDate = useMemo(
    () => new Map(history.map((item) => [item.date, item])),
    [history]
  );

  // LOAD TEMPLATE, DAILY RECORDS AND LINKED TRACKER DATA
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadDailyGoal() {
      try {
        setLoading(true);
        setError("");

        const [
          template,
          dailyRecord,
          prayerLog,
          quranLog,
          records,
        ] = await Promise.all([
          getDailyGoalTemplate(user!.uid),
          getDailyGoalRecord(user!.uid, selectedDate),
          getDailyPrayerLog(user!.uid, selectedDate),
          getDailyQuranLog(user!.uid, selectedDate),
          getDailyGoalRecords(user!.uid),
        ]);

        if (!active) return;

        const currentTemplateActivities =
          template?.activities ?? [];

        // Today uses the latest template.
        // Past dates use their saved activity snapshot.
        const dayActivities = viewingToday
          ? currentTemplateActivities
          : dailyRecord?.activities ?? [];

        const nextCompleted: Record<string, boolean> = {
          ...(dailyRecord?.completed ?? {}),
        };

        const nextPageCounts: Record<string, string> = {};

        // Derive prayer and Quran states from existing records.
        const linkedChecks = await Promise.all(
          dayActivities.map(async (activity) => {
            if (activity.type === "prayer" && activity.prayerName) {
              const prayer = activity.prayerName;

              const isFard = (
                fardPrayerNames as readonly string[]
              ).includes(prayer);

              return {
                id: activity.id,
                completed: isFard
                  ? prayerLog.fard[
                      prayer as (typeof fardPrayerNames)[number]
                    ]
                  : prayerLog.voluntary[
                      prayer as (typeof voluntaryPrayerNames)[number]
                    ],
              };
            }

            if (activity.type === "quran_pages") {
              const pages = quranLog.pagesRead;

              nextPageCounts[activity.id] = String(pages);

              return {
                id: activity.id,
                completed:
                  pages >= (activity.targetPages ?? 1),
              };
            }

            if (
              activity.type === "quran_template" &&
              activity.quranTemplateId
            ) {
              const isComplete =
                await getQuranTemplateCompletion(
                  user!.uid,
                  selectedDate,
                  activity.quranTemplateId
                );

              return {
                id: activity.id,
                completed: isComplete,
              };
            }

            // Custom activity uses the daily goal record.
            return {
              id: activity.id,
              completed:
                dailyRecord?.completed[activity.id] === true,
            };
          })
        );

        linkedChecks.forEach((item) => {
          nextCompleted[item.id] = item.completed;
        });

        if (!active) return;

        setTemplateActivities(currentTemplateActivities);
        setActivities(dayActivities);
        setCompleted(nextCompleted);
        setPageCounts(nextPageCounts);

        let nextHistory = records;

        // Update a record if linked tracker activity changed.
        // Also synchronize today's record with template edits.
        if (
          dailyRecord ||
          (viewingToday &&
            Object.values(nextCompleted).some(Boolean))
        ) {
          const updatedRecord = await saveDailyGoalRecord(
            user!.uid,
            selectedDate,
            dayActivities,
            nextCompleted
          );

          nextHistory = [
            ...records.filter(
              (item) => item.date !== selectedDate
            ),
            updatedRecord,
          ].sort((a, b) => a.date.localeCompare(b.date));
        }

        if (active) {
          setHistory(nextHistory);
        }
      } catch (error) {
        console.error("Daily goal loading error:", error);

        if (active) {
          setError(
            "Unable to load your daily goals. Please refresh."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDailyGoal();

    return () => {
      active = false;
    };
  }, [user, authLoading, selectedDate, viewingToday]);

  async function persistRecord(
    nextCompleted: Record<string, boolean>,
    nextActivities = activities
  ) {
    if (!user) return;

    const record = await saveDailyGoalRecord(
      user.uid,
      selectedDate,
      nextActivities,
      nextCompleted
    );

    setHistory((previous) => [
      ...previous.filter(
        (item) => item.date !== selectedDate
      ),
      record,
    ].sort((a, b) => a.date.localeCompare(b.date)));
  }

  // ADD ACTIVITY TO THE USER'S PERSONAL TEMPLATE
  async function handleAddActivity() {
    if (!user || saving) return;

    setError("");

    try {
      setSaving("adding");

      const id = createActivityId();

      let activity: DailyGoalActivity;

      if (category === "prayer") {
        activity = {
          id,
          title: prayerLabels[prayerName],
          category: "prayer",
          type: "prayer",
          prayerName,
        };
      } else if (category === "quran") {
        const name = activityName.trim() || "Quran reading";
        const target = Number(targetPages);

        if (
          !Number.isInteger(target) ||
          target < 1 ||
          target > 604
        ) {
          throw new Error("Enter a valid Quran page target.");
        }

        activity = {
          id,
          title: name,
          category: "quran",
          type: "quran_pages",
          targetPages: target,
        };
      } else if (
        category === "surah" ||
        category === "dhikr"
      ) {
        const name = activityName.trim();

        if (!name) {
          throw new Error("Enter an activity name.");
        }

        let count: number | undefined;

        if (category === "dhikr") {
          count = Number(dhikrCount);

          if (!Number.isInteger(count) || count < 1) {
            throw new Error("Enter a valid Dhikr count.");
          }
        }

        // Create it in the existing Quran/Dhikr template system.
        const quranTemplate = await addQuranTemplate(
          user.uid,
          name,
          category,
          name,
          count
        );

        activity = {
          id,
          title: name,
          category,
          type: "quran_template",
          quranTemplateId: quranTemplate.id,
        };
      } else {
        const name = activityName.trim();

        if (!name) {
          throw new Error("Enter a custom activity name.");
        }

        activity = {
          id,
          title: name,
          category: "custom",
          type: "custom",
        };
      }

      const nextActivities = [
        ...templateActivities,
        activity,
      ];

      const savedTemplate = await saveDailyGoalTemplate(
        user.uid,
        nextActivities
      );

      setTemplateActivities(savedTemplate.activities);
      setActivities(nextActivities);
      setCompleted((previous) => ({
        ...previous,
        [activity.id]: false,
      }));

      setBuilderOpen(false);
      setActivityName("");
      setTargetPages("5");
      setDhikrCount("33");

      // If today's record already exists, update its template snapshot.
      if (history.some((item) => item.date === today)) {
        const nextCompleted = {
          ...completed,
          [activity.id]: false,
        };

        await persistRecord(nextCompleted, nextActivities);
      }
    } catch (error) {
      console.error("Could not add daily activity:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not add this activity."
      );
    } finally {
      setSaving(null);
    }
  }

  // REMOVE ACTIVITY FROM TEMPLATE
  async function handleRemoveActivity(activityId: string) {
    if (!user || saving || !viewingToday) return;

    try {
      setSaving(activityId);

      const nextActivities = templateActivities.filter(
        (item) => item.id !== activityId
      );

      const nextCompleted = { ...completed };
      delete nextCompleted[activityId];

      await saveDailyGoalTemplate(user.uid, nextActivities);

      setTemplateActivities(nextActivities);
      setActivities(nextActivities);
      setCompleted(nextCompleted);

      if (history.some((item) => item.date === today)) {
        await persistRecord(nextCompleted, nextActivities);
      }
    } catch (error) {
      console.error("Could not remove activity:", error);
      setError("Could not remove this activity.");
    } finally {
      setSaving(null);
    }
  }

  // TOGGLE PRAYER, SURAH, DHIKR OR CUSTOM ACTIVITY
  async function toggleActivity(activity: DailyGoalActivity) {
    if (!user || saving || activity.type === "quran_pages") {
      return;
    }

    const nextValue = !completed[activity.id];

    const nextCompleted = {
      ...completed,
      [activity.id]: nextValue,
    };

    setSaving(activity.id);
    setError("");

    try {
      if (activity.type === "prayer" && activity.prayerName) {
        await savePrayerCompletion(
          user.uid,
          selectedDate,
          activity.prayerName,
          nextValue
        );
      }

      if (
        activity.type === "quran_template" &&
        activity.quranTemplateId
      ) {
        await saveQuranTemplateCompletion(
          user.uid,
          selectedDate,
          activity.quranTemplateId,
          nextValue
        );
      }

      // Custom activities are stored in daily goal records.
      await persistRecord(nextCompleted);
      setCompleted(nextCompleted);
    } catch (error) {
      console.error("Could not update activity:", error);
      setError("Could not save this activity. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  // SAVE QURAN PAGE PROGRESS TO THE EXISTING QURAN TRACKER
  async function handleSaveQuranPages(
    activity: DailyGoalActivity
  ) {
    if (!user || saving) return;

    const pages = Number(pageCounts[activity.id] ?? 0);

    if (
      !Number.isInteger(pages) ||
      pages < 0 ||
      pages > 604
    ) {
      setError("Enter a valid number of Quran pages.");
      return;
    }

    setSaving(activity.id);
    setError("");

    try {
      await saveDailyQuranPages(
        user.uid,
        selectedDate,
        pages
      );

      const nextCompleted = {
        ...completed,
        [activity.id]:
          pages >= (activity.targetPages ?? 1),
      };

      setCompleted(nextCompleted);
      await persistRecord(nextCompleted);
    } catch (error) {
      console.error("Could not save Quran pages:", error);
      setError("Could not save Quran progress.");
    } finally {
      setSaving(null);
    }
  }

  const selectedRecord = historyByDate.get(selectedDate);

  if (authLoading || loading) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 text-slate-400">
        <Loader2 className="mr-2 inline animate-spin" size={18} />
        Loading Daily Goals...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 text-center text-slate-300">
        Sign in to create and track your daily goal template.
        <Link
          href="/login"
          className="ml-2 font-semibold text-emerald-400"
        >
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CalendarDays size={18} />
            <span className="text-sm font-semibold">
              Personal Routine
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Daily Goal Template
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Build your own optional daily activities and track your consistency.
          </p>
        </div>

        {viewingToday && (
          <button
            type="button"
            onClick={() => setBuilderOpen((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            {builderOpen ? <X size={18} /> : <Plus size={18} />}
            {builderOpen ? "Close Builder" : "Edit My Template"}
          </button>
        )}
      </div>

      {/* BUILDER */}
      {builderOpen && viewingToday && (
        <div className="rounded-3xl border border-emerald-500/20 bg-[#07111F] p-5 sm:p-7">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-white">
              Add an activity
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Choose only the activities you want in your routine.
              Nothing is mandatory.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Activity category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as DailyGoalCategory
                  )
                }
                className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="prayer">Prayer</option>
                <option value="quran">Quran reading</option>
                <option value="surah">Surah</option>
                <option value="dhikr">Dhikr</option>
                <option value="custom">Custom activity</option>
              </select>
            </div>

            {category === "prayer" && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Select prayer
                </label>

                <select
                  value={prayerName}
                  onChange={(event) =>
                    setPrayerName(
                      event.target.value as TrackablePrayerName
                    )
                  }
                  className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  {prayerOptions.map((prayer) => (
                    <option key={prayer} value={prayer}>
                      {prayerLabels[prayer]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {category === "quran" && (
              <>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Activity name
                  </label>

                  <input
                    value={activityName}
                    onChange={(event) =>
                      setActivityName(event.target.value)
                    }
                    placeholder="Quran reading"
                    className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Target pages per day
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={targetPages}
                    onChange={(event) =>
                      setTargetPages(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {(category === "surah" ||
              category === "dhikr" ||
              category === "custom") && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  {category === "surah"
                    ? "Surah name"
                    : category === "dhikr"
                    ? "Dhikr name"
                    : "Activity name"}
                </label>

                <input
                  value={activityName}
                  onChange={(event) =>
                    setActivityName(event.target.value)
                  }
                  placeholder={
                    category === "surah"
                      ? "e.g. Surah Waqiah"
                      : category === "dhikr"
                      ? "e.g. SubhanAllah"
                      : "e.g. Read an Islamic book"
                  }
                  className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {category === "dhikr" && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Target repetitions
                </label>

                <input
                  type="number"
                  min="1"
                  value={dhikrCount}
                  onChange={(event) =>
                    setDhikrCount(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#243247] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 text-sm text-rose-400">{error}</p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => void handleAddActivity()}
              disabled={saving !== null}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving === "adding" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              Add to My Template
            </button>
          </div>
        </div>
      )}

      {/* DAILY CHECKLIST */}
      <div className="rounded-3xl border border-[#172235] bg-[#07111F] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              {viewingToday ? "Today" : "Daily history"}
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {formatDate(selectedDate)}
            </h3>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
            <p className="text-xs text-emerald-200">
              Daily completion
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {percentage}%
            </p>
          </div>
        </div>

        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {completedCount} of {activities.length} activities completed
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.category);
            const isComplete = completed[activity.id] === true;
            const isSaving = saving === activity.id;

            return (
              <div
                key={activity.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  isComplete
                    ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                    : "border-[#243247] bg-[#0A1624]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                    <Icon size={19} className="text-emerald-300" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-white">
                      {activity.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {activity.category === "quran" &&
                      activity.type === "quran_pages"
                        ? `Target: ${activity.targetPages} pages`
                        : activity.category === "prayer"
                        ? "Prayer Tracker linked"
                        : activity.category === "surah" ||
                          activity.category === "dhikr"
                        ? "Quran & Dhikr Tracker linked"
                        : "Personal activity"}
                    </p>
                  </div>
                </div>

                {activity.type === "quran_pages" ? (
                  <div className="flex items-center gap-3 sm:justify-end">
                    <input
                      type="number"
                      min="0"
                      max="604"
                      value={pageCounts[activity.id] ?? "0"}
                      onChange={(event) =>
                        setPageCounts((previous) => ({
                          ...previous,
                          [activity.id]: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        void handleSaveQuranPages(activity)
                      }
                      disabled={isSaving}
                      aria-label="Quran pages read"
                      className="w-24 rounded-lg border border-[#34445C] bg-[#07111F] px-3 py-2 text-center text-white outline-none focus:border-emerald-500"
                    />

                    <span className="text-xs text-slate-400">
                      pages
                    </span>

                    {isComplete && (
                      <Check className="text-emerald-400" size={19} />
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void toggleActivity(activity)}
                    disabled={saving !== null}
                    aria-label={`Mark ${activity.title} ${
                      isComplete ? "incomplete" : "complete"
                    }`}
                    aria-pressed={isComplete}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                      isComplete
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/[0.05] text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : isComplete ? (
                      <Check size={17} />
                    ) : (
                      <Circle size={17} />
                    )}

                    {isComplete ? "Completed" : "Mark complete"}
                  </button>
                )}

                {viewingToday && builderOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleRemoveActivity(activity.id)
                    }
                    disabled={saving !== null}
                    aria-label={`Remove ${activity.title}`}
                    className="self-end text-slate-500 transition hover:text-rose-400 sm:self-auto"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#34445C] p-8 text-center">
              {viewingToday ? (
                <>
                  <CalendarDays
                    size={30}
                    className="mx-auto text-slate-500"
                  />

                  <h4 className="mt-3 font-semibold text-white">
                    Your daily template is empty
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Add your own prayers, Quran reading, Surahs,
                    Dhikr and custom activities. You decide what
                    belongs in your routine.
                  </p>

                  <button
                    type="button"
                    onClick={() => setBuilderOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950"
                  >
                    <Plus size={17} />
                    Create My Template
                  </button>
                </>
              ) : (
                <>
                  <CalendarDays
                    size={28}
                    className="mx-auto text-slate-500"
                  />

                  <p className="mt-3 font-semibold text-white">
                    No saved daily goal record
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    No activities were recorded for this date.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONTRIBUTION HEATMAP */}
      <div className="rounded-3xl border border-[#172235] bg-[#07111F] p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Daily Goal History
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Your daily consistency over the last year.
            </p>
          </div>

          <span className="text-sm text-emerald-300">
            {history.length} recorded days
          </span>
        </div>

        <div className="mt-6 overflow-x-auto pb-3">
          <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
            {heatmapDays.map((date) => {
              const record = historyByDate.get(date);
              const isSelected = date === selectedDate;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  title={`${date}: ${
                    record ? `${record.percentage}% completed` : "No record"
                  }`}
                  aria-label={`${formatDate(date)}: ${
                    record ? `${record.percentage}% completed` : "No record"
                  }`}
                  className={`h-3 w-3 rounded-[3px] transition hover:ring-2 hover:ring-white/50 ${
                    isSelected
                      ? "ring-2 ring-white"
                      : ""
                  }`}
                  style={{
                    backgroundColor: heatmapColor(
                      record?.percentage,
                      Boolean(record)
                    ),
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Select any square to view that day's record.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            Less

            {[0, 25, 50, 75, 100].map((value) => (
              <span
                key={value}
                className="h-3 w-3 rounded-[3px]"
                style={{
                  backgroundColor: heatmapColor(
                    value,
                    value > 0
                  ),
                }}
              />
            ))}

            More
          </div>
        </div>

        {!viewingToday && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-[#243247] bg-[#0A1624] p-3">
            <p className="text-sm text-slate-300">
              Viewing {formatDate(selectedDate)}
            </p>

            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Back to today
            </button>
          </div>
        )}

        {selectedRecord && (
          <div className="mt-4 rounded-xl border border-[#243247] bg-[#0A1624] p-4">
            <p className="font-semibold text-white">
              {formatDate(selectedDate)}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {selectedRecord.completedCount} of{" "}
              {selectedRecord.totalCount} activities completed
              ({selectedRecord.percentage}%)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}