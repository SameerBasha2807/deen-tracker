
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FormEvent } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  BookOpen,
  X,
  History,
  Target,
  RotateCcw,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";

import { useAuth } from "@/contexts/AuthContext";

import {
  createQadaObligation,
  updateQadaObligation,
  deleteQadaObligation,
  createQadaCompletion,
  updateQadaCompletion,
  deleteQadaCompletion,
  getQadaData,
  type QadaObligation,
  type QadaCompletion,
} from "@/lib/ramadan-qada";


/* =====================================================
   HELPERS
===================================================== */

function getTodayDate(): string {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(date: string): string {
  if (!date) return "Unknown date";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =====================================================
   QADA FASTING PAGE
===================================================== */

export default function QadaFastingPage() {
  const { user, loading: authLoading } = useAuth();

  const [obligations, setObligations] = useState<
    QadaObligation[]
  >([]);

  const [completions, setCompletions] = useState<
    QadaCompletion[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Obligation form
  const [showObligationForm, setShowObligationForm] =
    useState(false);

  const [editingObligation, setEditingObligation] =
    useState<QadaObligation | null>(null);

  const [label, setLabel] = useState("");
  const [sourceHijriYear, setSourceHijriYear] =
    useState("");

  const [totalDays, setTotalDays] = useState("1");

  // Completion form
  const [showCompletionForm, setShowCompletionForm] =
    useState(false);

  const [selectedObligationId, setSelectedObligationId] =
    useState("");

  const [completedDate, setCompletedDate] =
    useState(getTodayDate());

  const [completionNote, setCompletionNote] =
    useState("");

  // Completion editing
  const [editingCompletionId, setEditingCompletionId] =
    useState<string | null>(null);

  const [editCompletedDate, setEditCompletedDate] =
    useState("");

  const [editCompletionNote, setEditCompletionNote] =
    useState("");

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  /* =====================================================
     LOAD QADA DATA
  ===================================================== */

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const result = await getQadaData(user.uid);

      setObligations(result.obligations);
      setCompletions(result.completions);
    } catch (err) {
      console.error("Qada loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Qada records."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    void loadData();
  }, [user, authLoading, loadData]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalOwed = useMemo(
    () =>
      obligations.reduce(
        (sum, item) => sum + item.totalDays,
        0
      ),
    [obligations]
  );

  const completedCount = useMemo(
    () =>
      obligations.reduce(
        (sum, item) => sum + item.completedDays,
        0
      ),
    [obligations]
  );

  const remainingCount = Math.max(
    0,
    totalOwed - completedCount
  );

  const completionPercentage =
    totalOwed > 0
      ? Math.min(
          100,
          Math.round(
            (completedCount / totalOwed) * 100
          )
        )
      : 0;

  const availableObligations = useMemo(
    () =>
      obligations.filter(
        (item) => item.completedDays < item.totalDays
      ),
    [obligations]
  );

  /* =====================================================
     OPEN CREATE FORM
  ===================================================== */

  function openCreateForm() {
    setEditingObligation(null);

    setLabel("");
    setSourceHijriYear("");
    setTotalDays("1");

    setError("");
    setSuccess("");

    setShowObligationForm(true);
  }

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  function openEditForm(item: QadaObligation) {
    setEditingObligation(item);

    setLabel(item.label);

    setSourceHijriYear(
      item.sourceHijriYear !== null
        ? String(item.sourceHijriYear)
        : ""
    );

    setTotalDays(String(item.totalDays));

    setError("");
    setSuccess("");

    setShowObligationForm(true);
  }

  /* =====================================================
     CREATE / UPDATE OBLIGATION
  ===================================================== */

  async function handleSaveObligation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) return;

    const days = Number(totalDays);

    const year =
      sourceHijriYear.trim() === ""
        ? null
        : Number(sourceHijriYear);

    if (
      year !== null &&
      (
        !Number.isInteger(year) ||
        year < 1300 ||
        year > 1600
      )
    ) {
      setError("Enter a valid Hijri year.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const input = {
        label,
        sourceHijriYear: year,
        totalDays: days,
      };

      if (editingObligation) {
        await updateQadaObligation(
          user.uid,
          editingObligation.id,
          input
        );

        setSuccess("Qada obligation updated successfully.");
      } else {
        await createQadaObligation(
          user.uid,
          input
        );

        setSuccess("Qada obligation added successfully.");
      }

      setShowObligationForm(false);
      setEditingObligation(null);

      await loadData();
    } catch (err) {
      console.error("Save Qada obligation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Qada obligation."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE OBLIGATION
  ===================================================== */

  async function handleDeleteObligation(
    item: QadaObligation
  ) {
    if (!user) return;

    const confirmed = window.confirm(
      `Delete "${item.label}"?\n\nAll completion history and notes associated with this obligation will also be permanently deleted.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(item.id);
      setError("");
      setSuccess("");

      await deleteQadaObligation(
        user.uid,
        item.id
      );

      if (selectedObligationId) {
        setSelectedObligationId("");
      }

      setSuccess("Qada obligation deleted.");

      await loadData();
    } catch (err) {
      console.error("Delete Qada error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete Qada obligation."
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =====================================================
     OPEN COMPLETION FORM
  ===================================================== */

  function openCompletionForm() {
    setSelectedObligationId(
      availableObligations[0]?.id ?? ""
    );

    setCompletedDate(getTodayDate());
    setCompletionNote("");

    setError("");
    setSuccess("");

    setShowCompletionForm(true);
  }

  /* =====================================================
     RECORD COMPLETED QADA FAST
  ===================================================== */

  async function handleSaveCompletion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user || !selectedObligationId) {
      setError("Select a Qada obligation first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createQadaCompletion(
        user.uid,
        selectedObligationId,
        completedDate,
        completionNote
      );

      setShowCompletionForm(false);

      setCompletionNote("");

      setSuccess(
        "Completed Qada fast recorded successfully."
      );

      await loadData();
    } catch (err) {
      console.error("Qada completion error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to record completed fast."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     OPEN COMPLETION EDITOR
  ===================================================== */

  function openCompletionEditor(
    item: QadaCompletion
  ) {
    setEditingCompletionId(item.id);
    setEditCompletedDate(item.completedDate);
    setEditCompletionNote(item.note);

    setError("");
  }

  /* =====================================================
     UPDATE COMPLETION
  ===================================================== */

  async function handleUpdateCompletion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user || !editingCompletionId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateQadaCompletion(
        user.uid,
        editingCompletionId,
        editCompletedDate,
        editCompletionNote
      );

      setEditingCompletionId(null);

      setSuccess("Completion record updated.");

      await loadData();
    } catch (err) {
      console.error("Update completion error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update completion."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE COMPLETION
  ===================================================== */

  async function handleDeleteCompletion(
    item: QadaCompletion
  ) {
    if (!user) return;

    const confirmed = window.confirm(
      "Remove this completed Qada fast record?\n\nYour outstanding balance will increase by one."
    );

    if (!confirmed) return;

    try {
      setProcessingId(item.id);
      setError("");
      setSuccess("");

      await deleteQadaCompletion(
        user.uid,
        item.id
      );

      setSuccess(
        "Completion removed and balance updated."
      );

      await loadData();
    } catch (err) {
      console.error("Delete completion error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove completion."
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

        <div className="space-y-7 p-4 sm:p-8">

          {/* PAGE HEADER */}

          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <Link
                href="/dashboard/ramadan/fasting"
                className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
              >
                <ArrowLeft size={17} />
                Back to Fasting Tracker
              </Link>

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                  <MoonIcon />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Qada Fasting
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Manage and complete your outstanding fasts.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={openCreateForm}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-400/40 hover:text-amber-300"
              >
                <Plus size={18} />
                Add Obligation
              </button>

              <button
                type="button"
                disabled={availableObligations.length === 0}
                onClick={openCompletionForm}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 size={18} />
                Record Completed Fast
              </button>

            </div>

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

          {/* ADD / EDIT OBLIGATION FORM */}

          {showObligationForm && (
            <section className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingObligation
                      ? "Edit Qada Obligation"
                      : "Add Qada Obligation"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Enter the number of fasts you intend to make up.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowObligationForm(false)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSaveObligation}
                className="grid gap-5 md:grid-cols-3"
              >

                <div>
                  <label
                    htmlFor="qada-label"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Obligation Name
                  </label>

                  <input
                    id="qada-label"
                    type="text"
                    required
                    maxLength={100}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Example: Ramadan 1447 AH"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="qada-year"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Source Hijri Year (Optional)
                  </label>

                  <input
                    id="qada-year"
                    type="number"
                    min="1300"
                    max="1600"
                    value={sourceHijriYear}
                    onChange={(e) =>
                      setSourceHijriYear(e.target.value)
                    }
                    placeholder="Example: 1447"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="qada-total"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Total Fastings Owed
                  </label>

                  <input
                    id="qada-total"
                    type="number"
                    required
                    min="1"
                    max="500"
                    value={totalDays}
                    onChange={(e) =>
                      setTotalDays(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-3 flex flex-wrap gap-3">

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    {editingObligation
                      ? "Save Changes"
                      : "Add Obligation"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setShowObligationForm(false)
                    }
                    className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </section>
          )}

          {/* RECORD COMPLETION FORM */}

          {showCompletionForm && (
            <section className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Record Completed Qada Fast
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Record a fast that you have completed.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowCompletionForm(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSaveCompletion}
                className="grid gap-5 md:grid-cols-3"
              >

                <div>
                  <label
                    htmlFor="completion-obligation"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select Obligation
                  </label>

                  <select
                    id="completion-obligation"
                    required
                    value={selectedObligationId}
                    onChange={(e) =>
                      setSelectedObligationId(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">
                      Select a Qada obligation
                    </option>

                    {availableObligations.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.label} — {item.totalDays - item.completedDays} remaining
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="completion-date"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Completion Date
                  </label>

                  <input
                    id="completion-date"
                    type="date"
                    required
                    value={completedDate}
                    onChange={(e) =>
                      setCompletedDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="completion-note"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Personal Note (Optional)
                  </label>

                  <input
                    id="completion-note"
                    type="text"
                    maxLength={500}
                    value={completionNote}
                    onChange={(e) =>
                      setCompletionNote(e.target.value)
                    }
                    placeholder="Add a note..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-3 flex flex-wrap gap-3">

                  <button
                    type="submit"
                    disabled={saving || !selectedObligationId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    Save Completed Fast
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setShowCompletionForm(false)
                    }
                    className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </section>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center gap-3 text-slate-400">
              <Loader2 className="animate-spin" />
              Loading Qada records...
            </div>
          ) : (
            <>
              {/* SUMMARY CARDS */}

              <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

                <SummaryCard
                  title="Total Owed"
                  value={totalOwed}
                  description="All recorded obligations"
                  color="amber"
                  icon={<Target size={21} />}
                />

                <SummaryCard
                  title="Completed"
                  value={completedCount}
                  description="Completed Qada fasts"
                  color="emerald"
                  icon={<CheckCircle2 size={21} />}
                />

                <SummaryCard
                  title="Remaining"
                  value={remainingCount}
                  description="Outstanding fasts"
                  color="red"
                  icon={<Clock size={21} />}
                />

                <SummaryCard
                  title="Progress"
                  value={`${completionPercentage}%`}
                  description="Overall completion"
                  color="blue"
                  icon={<CalendarDays size={21} />}
                />

              </section>

              {/* OVERALL PROGRESS */}

              <section className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-[#16231F] via-[#111D24] to-[#111827] p-6 sm:p-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="flex items-center gap-2 text-amber-300">
                      <BookOpen size={20} />
                      <span className="text-sm font-semibold">
                        Your Qada Journey
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-bold">
                      Keep progressing, one fast at a time.
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {completedCount} completed out of {totalOwed} recorded fasts.
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-4xl font-bold text-emerald-400">
                      {completionPercentage}%
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Overall completion
                    </p>
                  </div>

                </div>

                <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />

                </div>

              </section>

              {/* OBLIGATIONS */}

              <section className="space-y-5">

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      Qada Obligations
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Your separately recorded make-up fasting obligations.
                    </p>
                  </div>

                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                    {obligations.length} Records
                  </span>
                </div>

                {obligations.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">

                    <Target
                      size={40}
                      className="mx-auto text-amber-300"
                    />

                    <h3 className="mt-4 text-lg font-bold">
                      No Qada obligations yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                      Add the number of fasts you need to make up.
                      Your progress will be tracked separately from
                      your Ramadan fasting history.
                    </p>

                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold hover:bg-emerald-500"
                    >
                      <Plus size={17} />
                      Add First Obligation
                    </button>

                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">

                    {obligations.map((item) => {
                      const remaining = Math.max(
                        0,
                        item.totalDays - item.completedDays
                      );

                      const percentage =
                        item.totalDays > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (item.completedDays / item.totalDays) * 100
                              )
                            )
                          : 0;

                      return (
                        <article
                          key={item.id}
                          className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={19}
                                  className="text-amber-300"
                                />

                                <span className="text-xs text-slate-500">
                                  Qada Obligation
                                </span>
                              </div>

                              <h3 className="mt-3 text-lg font-bold">
                                {item.label}
                              </h3>

                              {item.sourceHijriYear !== null && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Source: {item.sourceHijriYear} AH
                                </p>
                              )}
                            </div>

                            <span
                              className={
                                remaining === 0
                                  ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                  : "rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300"
                              }
                            >
                              {remaining === 0
                                ? "Completed"
                                : `${remaining} Remaining`}
                            </span>

                          </div>

                          <div className="mt-6 grid grid-cols-3 gap-2">

                            <MiniStat
                              title="Total"
                              value={item.totalDays}
                            />

                            <MiniStat
                              title="Completed"
                              value={item.completedDays}
                            />

                            <MiniStat
                              title="Remaining"
                              value={remaining}
                            />

                          </div>

                          <div className="mt-5">

                            <div className="mb-2 flex justify-between text-xs">
                              <span className="text-slate-400">
                                Completion
                              </span>

                              <span className="font-semibold text-emerald-400">
                                {percentage}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-4">

                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400/40 hover:text-amber-300"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={processingId === item.id}
                              onClick={() =>
                                handleDeleteObligation(item)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {processingId === item.id ? (
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
                )}

              </section>

              {/* COMPLETION HISTORY */}

              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                  <div>
                    <div className="flex items-center gap-2">
                      <History
                        size={20}
                        className="text-amber-300"
                      />

                      <h2 className="text-xl font-bold">
                        Completion History
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      All your recorded completed Qada fasts.
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    {completions.length} Completions
                  </span>

                </div>

                {completions.length === 0 ? (
                  <div className="py-10 text-center">
                    <CheckCircle2
                      size={36}
                      className="mx-auto text-slate-600"
                    />

                    <p className="mt-4 text-sm font-semibold text-slate-300">
                      No completed Qada fasts yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Your completion history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">

                    {completions.map((item) => {
                      const relatedObligation =
                        obligations.find(
                          (obligation) =>
                            obligation.id === item.obligationId
                        );

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                        >

                          {editingCompletionId === item.id ? (
                            <form
                              onSubmit={handleUpdateCompletion}
                              className="space-y-4"
                            >

                              <h3 className="font-semibold text-white">
                                Edit Completion Record
                              </h3>

                              <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                  <label
                                    htmlFor={`edit-date-${item.id}`}
                                    className="mb-2 block text-xs text-slate-400"
                                  >
                                    Completion Date
                                  </label>

                                  <input
                                    id={`edit-date-${item.id}`}
                                    type="date"
                                    required
                                    value={editCompletedDate}
                                    onChange={(e) =>
                                      setEditCompletedDate(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`edit-note-${item.id}`}
                                    className="mb-2 block text-xs text-slate-400"
                                  >
                                    Personal Note
                                  </label>

                                  <input
                                    id={`edit-note-${item.id}`}
                                    type="text"
                                    maxLength={500}
                                    value={editCompletionNote}
                                    onChange={(e) =>
                                      setEditCompletionNote(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                                  />
                                </div>

                              </div>

                              <div className="flex gap-2">

                                <button
                                  type="submit"
                                  disabled={saving}
                                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                >
                                  {saving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    setEditingCompletionId(null)
                                  }
                                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                                >
                                  Cancel
                                </button>

                              </div>

                            </form>
                          ) : (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                  <CheckCircle2 size={21} />
                                </div>

                                <div>
                                  <h3 className="text-sm font-semibold text-white">
                                    {relatedObligation?.label ?? "Qada Fast"}
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(item.completedDate)}
                                  </p>

                                  {item.note && (
                                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                                      {item.note}
                                    </p>
                                  )}
                                </div>

                              </div>

                              <div className="flex shrink-0 gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openCompletionEditor(item)
                                  }
                                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-amber-400/40 hover:text-amber-300"
                                  aria-label="Edit completion"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  type="button"
                                  disabled={processingId === item.id}
                                  onClick={() =>
                                    handleDeleteCompletion(item)
                                  }
                                  className="rounded-lg border border-red-900/60 p-2 text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                  aria-label="Delete completion"
                                >
                                  {processingId === item.id ? (
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
                          )}

                        </div>
                      );
                    })}

                  </div>
                )}

              </section>

              {/* EMPTY STATE / GUIDANCE */}

              <section className="rounded-3xl border border-amber-400/10 bg-amber-400/5 p-5">

                <div className="flex items-start gap-3">
                  <RotateCcw
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-300"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">
                      Keep your Qada records accurate
                    </h3>

                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      Add only the fasts you have personally identified
                      as obligations to make up. The app does not
                      automatically convert missed or exempt Ramadan
                      days into Qada obligations.
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
   SMALL ICON COMPONENT
===================================================== */

function MoonIcon() {
  return (
    <span className="text-amber-300">
      <CalendarDays size={29} />
    </span>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  description,
  color,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  color: "amber" | "emerald" | "red" | "blue";
  icon: React.ReactNode;
}) {
  const styles = {
    amber:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    red:
      "border-red-500/20 bg-red-500/10 text-red-400",
    blue:
      "border-sky-500/20 bg-sky-500/10 text-sky-400",
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

/* =====================================================
   MINI STAT
===================================================== */

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-[11px] text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}
