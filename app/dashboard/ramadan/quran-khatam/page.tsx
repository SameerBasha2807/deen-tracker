
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Target,
  X,
  Save,
  BookMarked,
  History,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";

import { useAuth } from "@/contexts/AuthContext";

import {
  QURAN_KHATAM_TOTAL_PAGES,
  addQuranKhatamReading,
  createQuranKhatam,
  deleteQuranKhatam,
  deleteQuranKhatamReading,
  getQuranKhatamData,
  setQuranKhatamJuzCompleted,
  updateQuranKhatam,
  updateQuranKhatamReading,
  type QuranKhatamCategory,
  type QuranKhatamGoal,
  type QuranKhatamGoalInput,
  type QuranKhatamReading,
  type QuranKhatamReadingInput,
} from "@/lib/quran-khatam";

/* =====================================================
   HELPERS
===================================================== */

function todayDate(): string {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value: string): string {
  if (!value) return "Not set";

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDailyTarget(
  goal: QuranKhatamGoal
): number | null {
  if (
    !goal.targetDate ||
    goal.pagesRead >= goal.targetPages
  ) {
    return null;
  }

  const today = new Date(`${todayDate()}T00:00:00`);
  const target = new Date(`${goal.targetDate}T00:00:00`);

  const daysLeft =
    Math.floor(
      (target.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  if (daysLeft <= 0) {
    return null;
  }

  return Math.ceil(
    (goal.targetPages - goal.pagesRead) / daysLeft
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function QuranKhatamPage() {
  const { user, loading: authLoading } = useAuth();

  const [goals, setGoals] = useState<QuranKhatamGoal[]>([]);
  const [readings, setReadings] = useState<QuranKhatamReading[]>([]);

  const [selectedGoalId, setSelectedGoalId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  /* =====================================================
     GOAL FORM
  ===================================================== */

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] =
    useState<QuranKhatamGoal | null>(null);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] =
    useState<QuranKhatamCategory>("personal");
  const [goalStartDate, setGoalStartDate] =
    useState(todayDate());
  const [goalTargetDate, setGoalTargetDate] = useState("");

  /* =====================================================
     READING FORM
  ===================================================== */

  const [showReadingForm, setShowReadingForm] = useState(false);
  const [editingReadingId, setEditingReadingId] =
    useState<string | null>(null);

  const [readingDate, setReadingDate] = useState(todayDate());
  const [readingPages, setReadingPages] = useState("5");
  const [surahName, setSurahName] = useState("");
  const [ayahStart, setAyahStart] = useState("");
  const [ayahEnd, setAyahEnd] = useState("");
  const [juzNumber, setJuzNumber] = useState("");
  const [readingNote, setReadingNote] = useState("");

  /* =====================================================
     LOAD ALL DATA
  ===================================================== */

  const loadData = useCallback(
    async (preferredGoalId?: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const result = await getQuranKhatamData(user.uid);

        setGoals(result.goals);
        setReadings(result.readings);

        setSelectedGoalId((previous) => {
          if (
            preferredGoalId &&
            result.goals.some(
              (goal) => goal.id === preferredGoalId
            )
          ) {
            return preferredGoalId;
          }

          if (
            previous &&
            result.goals.some(
              (goal) => goal.id === previous
            )
          ) {
            return previous;
          }

          return result.goals[0]?.id ?? "";
        });
      } catch (err) {
        console.error("Quran Khatam loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Quran Khatam data."
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    void loadData();
  }, [user, authLoading, loadData]);

  /* =====================================================
     SELECTED GOAL
  ===================================================== */

  const selectedGoal = useMemo(
    () =>
      goals.find(
        (goal) => goal.id === selectedGoalId
      ) ?? null,
    [goals, selectedGoalId]
  );

  const selectedReadings = useMemo(
    () =>
      readings
        .filter(
          (reading) =>
            reading.khatamId === selectedGoalId
        )
        .sort((a, b) =>
          b.date.localeCompare(a.date)
        ),
    [readings, selectedGoalId]
  );

  const completedJuzCount =
    selectedGoal?.completedJuz.length ?? 0;

  const remainingPages = selectedGoal
    ? Math.max(
        0,
        selectedGoal.targetPages - selectedGoal.pagesRead
      )
    : 0;

  const pagePercentage = selectedGoal
    ? Math.min(
        100,
        Math.round(
          (selectedGoal.pagesRead /
            selectedGoal.targetPages) *
            100
        )
      )
    : 0;

  const juzPercentage = Math.round(
    (completedJuzCount / 30) * 100
  );

  const dailyTarget = selectedGoal
    ? getDailyTarget(selectedGoal)
    : null;

  /* =====================================================
     CREATE GOAL FORM
  ===================================================== */

  function openCreateGoalForm() {
    setEditingGoal(null);
    setGoalTitle("");
    setGoalCategory("personal");
    setGoalStartDate(todayDate());
    setGoalTargetDate("");
    setError("");
    setSuccess("");
    setShowGoalForm(true);
  }

  /* =====================================================
     EDIT GOAL FORM
  ===================================================== */

  function openEditGoalForm(goal: QuranKhatamGoal) {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalCategory(goal.category);
    setGoalStartDate(goal.startDate);
    setGoalTargetDate(goal.targetDate ?? "");
    setError("");
    setSuccess("");
    setShowGoalForm(true);
  }

  /* =====================================================
     SAVE GOAL
  ===================================================== */

  async function handleSaveGoal(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const input: QuranKhatamGoalInput = {
        title: goalTitle,
        category: goalCategory,
        startDate: goalStartDate,
        targetDate: goalTargetDate || null,
      };

      let goalId = editingGoal?.id;

      if (editingGoal) {
        await updateQuranKhatam(
          user.uid,
          editingGoal.id,
          input
        );

        setSuccess("Khatam goal updated successfully.");
      } else {
        goalId = await createQuranKhatam(
          user.uid,
          input
        );

        setSuccess("New Khatam goal created successfully.");
      }

      setShowGoalForm(false);
      setEditingGoal(null);

      await loadData(goalId);
    } catch (err) {
      console.error("Save Khatam goal error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Khatam goal."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE GOAL
  ===================================================== */

  async function handleDeleteGoal(
    goal: QuranKhatamGoal
  ) {
    if (!user) return;

    const confirmed = window.confirm(
      `Delete "${goal.title}"?\n\nAll reading records and Juz progress belonging to this goal will also be deleted. This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(goal.id);
      setError("");
      setSuccess("");

      await deleteQuranKhatam(
        user.uid,
        goal.id
      );

      setSuccess("Khatam goal deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("Delete Khatam error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete Khatam goal."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =====================================================
     OPEN CREATE READING FORM
  ===================================================== */

  function openCreateReadingForm() {
    setEditingReadingId(null);
    setReadingDate(todayDate());
    setReadingPages("5");
    setSurahName("");
    setAyahStart("");
    setAyahEnd("");
    setJuzNumber("");
    setReadingNote("");
    setError("");
    setSuccess("");
    setShowReadingForm(true);
  }

  /* =====================================================
     OPEN EDIT READING FORM
  ===================================================== */

  function openEditReadingForm(
    reading: QuranKhatamReading
  ) {
    setEditingReadingId(reading.id);
    setReadingDate(reading.date);
    setReadingPages(String(reading.pagesRead));
    setSurahName(reading.surahName);
    setAyahStart(
      reading.ayahStart === null
        ? ""
        : String(reading.ayahStart)
    );
    setAyahEnd(
      reading.ayahEnd === null
        ? ""
        : String(reading.ayahEnd)
    );
    setJuzNumber(
      reading.juzNumber === null
        ? ""
        : String(reading.juzNumber)
    );
    setReadingNote(reading.note);
    setError("");
    setSuccess("");
    setShowReadingForm(true);
  }

  /* =====================================================
     SAVE READING
  ===================================================== */

  async function handleSaveReading(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user || !selectedGoal) return;

    if (
      !Number.isInteger(Number(readingPages)) ||
      Number(readingPages) <= 0
    ) {
      setError("Enter a valid number of pages.");
      return;
    }

    const input: QuranKhatamReadingInput = {
      date: readingDate,
      pagesRead: Number(readingPages),
      surahName,
      ayahStart:
        ayahStart.trim() === ""
          ? null
          : Number(ayahStart),
      ayahEnd:
        ayahEnd.trim() === ""
          ? null
          : Number(ayahEnd),
      juzNumber:
        juzNumber.trim() === ""
          ? null
          : Number(juzNumber),
      note: readingNote,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingReadingId) {
        await updateQuranKhatamReading(
          user.uid,
          editingReadingId,
          input
        );

        setSuccess("Reading record updated successfully.");
      } else {
        await addQuranKhatamReading(
          user.uid,
          selectedGoal.id,
          input
        );

        setSuccess("Reading session recorded successfully.");
      }

      setShowReadingForm(false);
      setEditingReadingId(null);

      await loadData(selectedGoal.id);
    } catch (err) {
      console.error("Save Quran reading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save reading record."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE READING
  ===================================================== */

  async function handleDeleteReading(
    reading: QuranKhatamReading
  ) {
    if (!user || !selectedGoal) return;

    const confirmed = window.confirm(
      `Delete this reading record of ${reading.pagesRead} pages? Your Khatam page total will be reduced.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(reading.id);
      setError("");
      setSuccess("");

      await deleteQuranKhatamReading(
        user.uid,
        reading.id
      );

      setSuccess("Reading record deleted.");

      await loadData(selectedGoal.id);
    } catch (err) {
      console.error("Delete reading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete reading record."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =====================================================
     TOGGLE JUZ COMPLETION
  ===================================================== */

  async function handleToggleJuz(juz: number) {
    if (!user || !selectedGoal) return;

    const isCompleted =
      selectedGoal.completedJuz.includes(juz);

    try {
      setProcessingId(`juz-${juz}`);
      setError("");
      setSuccess("");

      await setQuranKhatamJuzCompleted(
        user.uid,
        selectedGoal.id,
        juz,
        !isCompleted
      );

      await loadData(selectedGoal.id);
    } catch (err) {
      console.error("Update Juz error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update Juz progress."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =====================================================
     AUTHENTICATION
  ===================================================== */

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020914] text-white">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020914] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Login Required
          </h1>

          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-emerald-600 px-6 py-3 font-semibold"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     PAGE UI
  ===================================================== */

  return (
    <main className="flex min-h-screen bg-[#020914] text-white">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <TopBar />

        <div className="space-y-8 p-4 sm:p-8">

          {/* PAGE HEADER */}

          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <Link
                href="/dashboard/quran"
                className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
              >
                <ArrowLeft size={17} />
                Back to Quran Dashboard
              </Link>

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                  <BookOpenCheck
                    size={29}
                    className="text-amber-300"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Quran Khatam
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Track your Quran completion journey.
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={openCreateGoalForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Plus size={18} />
              New Khatam
            </button>

          </section>

          {/* NOTIFICATIONS */}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          {/* GOAL FORM */}

          {showGoalForm && (
            <section className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">

              <div className="mb-6 flex items-center justify-between gap-3">

                <div>
                  <h2 className="text-xl font-bold">
                    {editingGoal
                      ? "Edit Khatam Goal"
                      : "Create Khatam Goal"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Every Khatam has a target of 604 pages.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowGoalForm(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>

              </div>

              <form
                onSubmit={handleSaveGoal}
                className="grid gap-5 md:grid-cols-2"
              >

                <div className="md:col-span-2">
                  <label
                    htmlFor="khatam-title"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Khatam Name
                  </label>

                  <input
                    id="khatam-title"
                    type="text"
                    required
                    maxLength={100}
                    value={goalTitle}
                    onChange={(e) =>
                      setGoalTitle(e.target.value)
                    }
                    placeholder="Example: My Ramadan Khatam"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="khatam-category"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Khatam Type
                  </label>

                  <select
                    id="khatam-category"
                    value={goalCategory}
                    onChange={(e) =>
                      setGoalCategory(
                        e.target.value as QuranKhatamCategory
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="personal">
                      Personal Khatam
                    </option>

                    <option value="ramadan">
                      Ramadan Khatam
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="khatam-start"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Start Date
                  </label>

                  <input
                    id="khatam-start"
                    type="date"
                    required
                    value={goalStartDate}
                    onChange={(e) =>
                      setGoalStartDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="khatam-target"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Target Completion Date (Optional)
                  </label>

                  <input
                    id="khatam-target"
                    type="date"
                    value={goalTargetDate}
                    min={goalStartDate}
                    onChange={(e) =>
                      setGoalTargetDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-3">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    {editingGoal
                      ? "Save Changes"
                      : "Create Khatam"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowGoalForm(false)}
                    className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </section>
          )}

          {/* INITIAL LOADING */}

          {loading && goals.length === 0 ? (
            <div className="flex min-h-[250px] items-center justify-center gap-3 text-slate-400">
              <Loader2 className="animate-spin" />
              Loading Quran Khatam...
            </div>
          ) : (
            <>
              {/* NO GOALS */}

              {goals.length === 0 && (
                <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">

                  <BookOpenCheck
                    size={46}
                    className="mx-auto text-amber-300"
                  />

                  <h2 className="mt-5 text-xl font-bold">
                    Begin Your Quran Khatam
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Create a personal or Ramadan Khatam goal.
                    Record your daily reading and track progress
                    across all 30 Juz.
                  </p>

                  <button
                    type="button"
                    onClick={openCreateGoalForm}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
                  >
                    <Plus size={18} />
                    Create First Khatam
                  </button>

                </section>
              )}

              {/* GOAL LIST */}

              {goals.length > 0 && (
                <section className="space-y-4">

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">
                        My Khatam Goals
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Select a goal to view its reading progress.
                      </p>
                    </div>

                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                      {goals.length} Goals
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                    {goals.map((goal) => {
                      const percentage = Math.min(
                        100,
                        Math.round(
                          (goal.pagesRead / goal.targetPages) *
                            100
                        )
                      );

                      const isSelected =
                        selectedGoalId === goal.id;

                      const isCompleted =
                        goal.pagesRead >= goal.targetPages;

                      return (
                        <article
                          key={goal.id}
                          className={`rounded-2xl border p-5 transition ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-slate-800 bg-slate-900/60"
                          }`}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedGoalId(goal.id)
                            }
                            className="block w-full text-left"
                          >

                            <div className="flex items-center justify-between gap-2">

                              <span className="text-xs font-medium text-amber-300">
                                {goal.category === "ramadan"
                                  ? "Ramadan Khatam"
                                  : "Personal Khatam"}
                              </span>

                              {isCompleted ? (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                                  Completed
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
                                  Active
                                </span>
                              )}

                            </div>

                            <h3 className="mt-3 text-lg font-bold text-white">
                              {goal.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Started {formatDate(goal.startDate)}
                            </p>

                            <div className="mt-5 flex items-center justify-between text-xs">
                              <span className="text-slate-400">
                                Pages read
                              </span>

                              <span className="font-semibold text-emerald-400">
                                {goal.pagesRead} / {goal.targetPages}
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                              {goal.completedJuz.length} of 30 Juz marked completed
                            </p>

                          </button>

                          <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">

                            <button
                              type="button"
                              onClick={() =>
                                openEditGoalForm(goal)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-amber-400/40 hover:text-amber-300"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={processingId === goal.id}
                              onClick={() =>
                                handleDeleteGoal(goal)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {processingId === goal.id ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>

                          </div>

                        </article>
                      );
                    })}

                  </div>

                </section>
              )}

              {/* SELECTED GOAL DETAILS */}

              {selectedGoal && (
                <>
                  {/* MAIN PROGRESS */}

                  <section className="overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-[#16231F] via-[#111D24] to-[#111827] p-6 sm:p-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                      <div>

                        <div className="flex items-center gap-2 text-amber-300">
                          <BookOpen size={20} />

                          <span className="text-sm font-semibold">
                            {selectedGoal.category === "ramadan"
                              ? "Ramadan Quran Journey"
                              : "Personal Quran Journey"}
                          </span>
                        </div>

                        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                          {selectedGoal.title}
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                          {formatDate(selectedGoal.startDate)}
                          {" — "}
                          {selectedGoal.targetDate
                            ? formatDate(selectedGoal.targetDate)
                            : "No target date"}
                        </p>

                      </div>

                      <div className="text-left md:text-right">

                        <p className="text-sm text-slate-400">
                          Overall page progress
                        </p>

                        <p className="mt-1 text-4xl font-bold text-emerald-400">
                          {pagePercentage}%
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {selectedGoal.pagesRead} of 604 pages
                        </p>

                      </div>

                    </div>

                    <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                        style={{
                          width: `${pagePercentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-slate-500">
                      <span>Start</span>
                      <span>{remainingPages} pages remaining</span>
                      <span>Complete</span>
                    </div>

                    {pagePercentage === 100 && (
                      <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
                        <CheckCircle2 size={24} />

                        <div>
                          <p className="font-semibold">
                            Quran Khatam completed
                          </p>

                          <p className="mt-1 text-xs text-emerald-300/70">
                            You have recorded all 604 pages for this goal.
                          </p>
                        </div>
                      </div>
                    )}

                  </section>

                  {/* SUMMARY CARDS */}

                  <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

                    <SummaryCard
                      title="Pages Read"
                      value={selectedGoal.pagesRead}
                      description="Out of 604 pages"
                      icon={<BookOpen size={21} />}
                      color="emerald"
                    />

                    <SummaryCard
                      title="Remaining Pages"
                      value={remainingPages}
                      description="Pages left to complete"
                      icon={<BookMarked size={21} />}
                      color="amber"
                    />

                    <SummaryCard
                      title="Juz Completed"
                      value={`${completedJuzCount}/30`}
                      description="Manually checked Juz"
                      icon={<CheckCircle2 size={21} />}
                      color="blue"
                    />

                    <SummaryCard
                      title="Daily Page Target"
                      value={
                        dailyTarget === null
                          ? "—"
                          : dailyTarget
                      }
                      description={
                        dailyTarget === null
                          ? "Set a future target date"
                          : "Pages per day to meet deadline"
                      }
                      icon={<Target size={21} />}
                      color="violet"
                    />

                  </section>

                  {/* READING ACTION */}

                  <section className="flex flex-col gap-4 rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <BookOpenCheck size={24} />
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          Daily Reading
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Record pages, Surah, Ayah and Juz details.
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      disabled={
                        selectedGoal.pagesRead >=
                        QURAN_KHATAM_TOTAL_PAGES
                      }
                      onClick={openCreateReadingForm}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={18} />
                      Log Reading
                    </button>

                  </section>

                  {/* READING FORM */}

                  {showReadingForm && (
                    <section className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">

                      <div className="mb-6 flex items-center justify-between gap-3">

                        <div>
                          <h2 className="text-xl font-bold">
                            {editingReadingId
                              ? "Edit Reading Record"
                              : "Record Quran Reading"}
                          </h2>

                          <p className="mt-1 text-sm text-slate-400">
                            {remainingPages} pages currently remain in this Khatam.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            setShowReadingForm(false)
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                          aria-label="Close reading form"
                        >
                          <X size={20} />
                        </button>

                      </div>

                      <form
                        onSubmit={handleSaveReading}
                        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                      >

                        <div>
                          <label
                            htmlFor="reading-date"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Reading Date
                          </label>

                          <input
                            id="reading-date"
                            type="date"
                            required
                            value={readingDate}
                            onChange={(e) =>
                              setReadingDate(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="reading-pages"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Pages Read
                          </label>

                          <input
                            id="reading-pages"
                            type="number"
                            required
                            min="1"
                            max={QURAN_KHATAM_TOTAL_PAGES}
                            value={readingPages}
                            onChange={(e) =>
                              setReadingPages(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="reading-juz"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Juz Read (Optional)
                          </label>

                          <select
                            id="reading-juz"
                            value={juzNumber}
                            onChange={(e) =>
                              setJuzNumber(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          >
                            <option value="">Not specified</option>

                            {Array.from(
                              { length: 30 },
                              (_, index) => index + 1
                            ).map((juz) => (
                              <option
                                key={juz}
                                value={juz}
                              >
                                Juz {juz}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="reading-surah"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Surah (Optional)
                          </label>

                          <input
                            id="reading-surah"
                            type="text"
                            maxLength={100}
                            value={surahName}
                            onChange={(e) =>
                              setSurahName(e.target.value)
                            }
                            placeholder="Example: Al-Baqarah"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ayah-start"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Starting Ayah (Optional)
                          </label>

                          <input
                            id="ayah-start"
                            type="number"
                            min="1"
                            value={ayahStart}
                            onChange={(e) =>
                              setAyahStart(e.target.value)
                            }
                            placeholder="Example: 1"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ayah-end"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Ending Ayah (Optional)
                          </label>

                          <input
                            id="ayah-end"
                            type="number"
                            min="1"
                            value={ayahEnd}
                            onChange={(e) =>
                              setAyahEnd(e.target.value)
                            }
                            placeholder="Example: 25"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                          <label
                            htmlFor="reading-note"
                            className="mb-2 block text-sm font-medium text-slate-300"
                          >
                            Personal Note (Optional)
                          </label>

                          <textarea
                            id="reading-note"
                            rows={3}
                            maxLength={500}
                            value={readingNote}
                            onChange={(e) =>
                              setReadingNote(e.target.value)
                            }
                            placeholder="Add a private note about this reading session..."
                            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                          />

                          <p className="mt-1 text-right text-xs text-slate-500">
                            {readingNote.length}/500
                          </p>
                        </div>

                        <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3">

                          <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={18} />
                            )}

                            {editingReadingId
                              ? "Save Reading Changes"
                              : "Save Reading"}
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setShowReadingForm(false)
                            }
                            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                          >
                            Cancel
                          </button>

                        </div>

                      </form>

                    </section>
                  )}

                  {/* JUZ TRACKER */}

                  <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <div className="flex items-center gap-2">
                          <BookMarked
                            size={21}
                            className="text-amber-300"
                          />

                          <h2 className="text-xl font-bold">
                            30 Juz Tracker
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                          Mark a Juz when you have completed reading it.
                        </p>
                      </div>

                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        {completedJuzCount}/30 Completed
                      </span>

                    </div>

                    <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${juzPercentage}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-10">

                      {Array.from(
                        { length: 30 },
                        (_, index) => index + 1
                      ).map((juz) => {
                        const completed =
                          selectedGoal.completedJuz.includes(juz);

                        const busy =
                          processingId === `juz-${juz}`;

                        return (
                          <button
                            key={juz}
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              handleToggleJuz(juz)
                            }
                            aria-pressed={completed}
                            className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition hover:-translate-y-0.5 disabled:opacity-50 ${
                              completed
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : "border-slate-700 bg-slate-950/60 text-slate-400 hover:border-amber-400/40 hover:text-amber-300"
                            }`}
                          >

                            {busy ? (
                              <Loader2
                                size={20}
                                className="animate-spin"
                              />
                            ) : completed ? (
                              <CheckCircle2 size={21} />
                            ) : (
                              <Circle size={21} />
                            )}

                            <span className="text-xs font-semibold">
                              Juz {juz}
                            </span>

                            <span className="text-[10px] opacity-70">
                              {completed
                                ? "Completed"
                                : "Pending"}
                            </span>

                          </button>
                        );
                      })}

                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-500">
                      Juz completion is tracked separately from the page
                      total. Mark each Juz only after completing it.
                    </p>

                  </section>

                  {/* READING HISTORY */}

                  <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                      <div>
                        <div className="flex items-center gap-2">
                          <History
                            size={21}
                            className="text-amber-300"
                          />

                          <h2 className="text-xl font-bold">
                            Reading History
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                          All reading sessions for this Khatam.
                        </p>
                      </div>

                      <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                        {selectedReadings.length} Sessions
                      </span>

                    </div>

                    {selectedReadings.length === 0 ? (
                      <div className="py-10 text-center">

                        <BookOpen
                          size={38}
                          className="mx-auto text-slate-600"
                        />

                        <h3 className="mt-4 font-semibold text-slate-300">
                          No reading sessions yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Record your first Quran reading session to begin tracking progress.
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-3">

                        {selectedReadings.map((reading) => (
                          <article
                            key={reading.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                          >

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                  <BookOpen size={20} />
                                </div>

                                <div>
                                  <h3 className="font-semibold text-white">
                                    {reading.pagesRead}{" "}
                                    {reading.pagesRead === 1
                                      ? "Page"
                                      : "Pages"}{" "}
                                    Read
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(reading.date)}
                                  </p>

                                  {(reading.surahName ||
                                    reading.juzNumber !== null) && (
                                    <p className="mt-2 text-xs text-amber-300">
                                      {[
                                        reading.surahName,
                                        reading.juzNumber !== null
                                          ? `Juz ${reading.juzNumber}`
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" • ")}
                                    </p>
                                  )}

                                  {reading.ayahStart !== null &&
                                    reading.ayahEnd !== null && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Ayah {reading.ayahStart}–{reading.ayahEnd}
                                      </p>
                                    )}

                                  {reading.note && (
                                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                                      {reading.note}
                                    </p>
                                  )}

                                </div>

                              </div>

                              <div className="flex shrink-0 gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditReadingForm(reading)
                                  }
                                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-amber-400/40 hover:text-amber-300"
                                  aria-label="Edit reading record"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    processingId === reading.id
                                  }
                                  onClick={() =>
                                    handleDeleteReading(reading)
                                  }
                                  className="rounded-lg border border-red-900/60 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                  aria-label="Delete reading record"
                                >
                                  {processingId === reading.id ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>

                              </div>

                            </div>

                          </article>
                        ))}

                      </div>
                    )}

                  </section>

                </>
              )}

              {/* INFORMATION */}

              <section className="rounded-3xl border border-amber-400/10 bg-amber-400/5 p-5">

                <div className="flex items-start gap-3">
                  <BookOpenCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-300"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">
                      About your Khatam progress
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      Page progress is calculated from your saved reading
                      sessions. The 30-Juz checklist is a separate manual
                      tracker. The page target uses a 604-page Madani
                      Mushaf; page layouts may differ in other Quran
                      editions. Record each reading session only once
                      to avoid counting the same pages twice.
                    </p>
                  </div>
                </div>

              </section>

            </>
          )}

        </div>

      </div>

    </main>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  color: "emerald" | "amber" | "blue" | "violet";
}) {
  const styles = {
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    amber:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    blue:
      "border-sky-500/20 bg-sky-500/10 text-sky-400",
    violet:
      "border-violet-500/20 bg-violet-500/10 text-violet-400",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${styles[color]}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}
