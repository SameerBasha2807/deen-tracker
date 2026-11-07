
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

// =======================================================
// TYPES
// =======================================================

type PlannerCategory =
  | "suhoor"
  | "prayer"
  | "quran"
  | "dhikr"
  | "work"
  | "rest"
  | "iftar"
  | "taraweeh"
  | "charity"
  | "other";

interface PlannerTask {
  id: string;
  date: string;
  title: string;
  category: PlannerCategory;
  startTime: string;
  endTime: string;
  description: string;
  completed: boolean;
}

interface PlannerTaskForm {
  title: string;
  category: PlannerCategory;
  startTime: string;
  endTime: string;
  description: string;
}

const TASK_CATEGORIES: {
  value: PlannerCategory;
  label: string;
}[] = [
  { value: "suhoor", label: "Suhoor" },
  { value: "prayer", label: "Prayer" },
  { value: "quran", label: "Quran" },
  { value: "dhikr", label: "Dhikr" },
  { value: "work", label: "Work / Study" },
  { value: "rest", label: "Rest" },
  { value: "iftar", label: "Iftar" },
  { value: "taraweeh", label: "Taraweeh" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

// =======================================================
// HELPERS
// =======================================================

function getToday(): string {
  const date = new Date();

  date.setMinutes(
    date.getMinutes() - date.getTimezoneOffset()
  );

  return date.toISOString().slice(0, 10);
}

function changeDate(dateString: string, amount: number): string {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatDate(dateString: string): string {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getCategoryLabel(category: PlannerCategory): string {
  return (
    TASK_CATEGORIES.find((item) => item.value === category)?.label ??
    "Other"
  );
}

function createEmptyTask(): PlannerTaskForm {
  return {
    title: "",
    category: "prayer",
    startTime: "",
    endTime: "",
    description: "",
  };
}

// =======================================================
// MAIN PAGE
// =======================================================

export default function RamadanPlannerPage() {
  const { user, loading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState(getToday);

  const [intention, setIntention] = useState("");
  const [notes, setNotes] = useState("");

  const [tasks, setTasks] = useState<PlannerTask[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [taskForm, setTaskForm] =
    useState<PlannerTaskForm>(createEmptyTask);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Reference to the form so the page can scroll to it.
  const taskFormRef = useRef<HTMLElement | null>(null);

  // =====================================================
  // SCROLL TO TASK FORM WHEN OPENED
  // =====================================================

  useEffect(() => {
    if (!showTaskForm) return;

    const frame = window.requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showTaskForm]);

  function scrollToTaskForm() {
    window.requestAnimationFrame(() => {
      taskFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  // =====================================================
  // FIRESTORE REFERENCES
  // =====================================================

  function dayDocument(userId: string, date: string) {
    return doc(
      db,
      "users",
      userId,
      "ramadanPlannerDays",
      date
    );
  }

  function tasksCollection(userId: string) {
    return collection(
      db,
      "users",
      userId,
      "ramadanPlannerTasks"
    );
  }

  // =====================================================
  // LOAD SELECTED DAY
  // =====================================================

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setError("Please sign in to access your Ramadan Planner.");
      setTasks([]);
      return;
    }

    const userId = user.uid;
    let cancelled = false;

    async function loadPlanner() {
      try {
        setLoading(true);
        setError("");
        setNotice("");

        const [daySnapshot, taskSnapshot] = await Promise.all([
          getDoc(dayDocument(userId, selectedDate)),

          getDocs(
            query(
              tasksCollection(userId),
              where("date", "==", selectedDate)
            )
          ),
        ]);

        if (cancelled) return;

        if (daySnapshot.exists()) {
          const dayData = daySnapshot.data();

          setIntention(
            typeof dayData.intention === "string"
              ? dayData.intention
              : ""
          );

          setNotes(
            typeof dayData.notes === "string"
              ? dayData.notes
              : ""
          );
        } else {
          setIntention("");
          setNotes("");
        }

        const loadedTasks: PlannerTask[] = taskSnapshot.docs.map(
          (item) => {
            const data = item.data();

            return {
              id: item.id,
              date: data.date ?? selectedDate,
              title: data.title ?? "",
              category: data.category ?? "other",
              startTime: data.startTime ?? "",
              endTime: data.endTime ?? "",
              description: data.description ?? "",
              completed: data.completed === true,
            };
          }
        );

        loadedTasks.sort((a, b) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;

          return a.startTime.localeCompare(b.startTime);
        });

        setTasks(loadedTasks);
      } catch (err) {
        if (!cancelled) {
          console.error("Ramadan planner loading error:", err);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your planner."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlanner();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, selectedDate]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const pendingTasks = tasks.length - completedTasks;

  const progress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const today = getToday();

  // =====================================================
  // TASK FORM CONTROLS
  // =====================================================

  function openAddTaskForm() {
    setTaskForm(createEmptyTask());
    setEditingTaskId(null);
    setError("");
    setNotice("");
    setShowTaskForm(true);
  }

  function handleHeaderAddTask() {
    if (showTaskForm) {
      scrollToTaskForm();
      return;
    }

    openAddTaskForm();
  }

  function openEditTaskForm(task: PlannerTask) {
    setTaskForm({
      title: task.title,
      category: task.category,
      startTime: task.startTime,
      endTime: task.endTime,
      description: task.description,
    });

    setEditingTaskId(task.id);
    setShowTaskForm(true);
    setError("");
    setNotice("");
  }

  function closeTaskForm() {
    setShowTaskForm(false);
    setEditingTaskId(null);
    setTaskForm(createEmptyTask());
  }

  // =====================================================
  // SAVE DAILY INTENTION AND NOTES
  // =====================================================

  async function handleSaveDay() {
    if (!user) return;

    if (intention.length > 500 || notes.length > 2000) {
      setError("Please shorten your intention or notes.");
      return;
    }

    try {
      setSavingDay(true);
      setError("");
      setNotice("");

      const ref = dayDocument(user.uid, selectedDate);
      const existing = await getDoc(ref);

      if (existing.exists()) {
        await updateDoc(ref, {
          date: selectedDate,
          intention: intention.trim(),
          notes: notes.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          date: selectedDate,
          intention: intention.trim(),
          notes: notes.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setNotice("Your daily intention and notes have been saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your daily plan."
      );
    } finally {
      setSavingDay(false);
    }
  }

  // =====================================================
  // ADD / UPDATE TASK
  // =====================================================

  async function handleTaskSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) return;

    const title = taskForm.title.trim();
    const description = taskForm.description.trim();

    if (!title) {
      setError("Please enter a task title.");
      scrollToTaskForm();
      return;
    }

    if (title.length > 100 || description.length > 500) {
      setError("Task title or description is too long.");
      scrollToTaskForm();
      return;
    }

    if (
      taskForm.startTime &&
      taskForm.endTime &&
      taskForm.endTime < taskForm.startTime
    ) {
      setError("End time cannot be earlier than start time.");
      scrollToTaskForm();
      return;
    }

    try {
      setSavingTask(true);
      setError("");
      setNotice("");

      const userId = user.uid;

      const taskData = {
        date: selectedDate,
        title,
        category: taskForm.category,
        startTime: taskForm.startTime,
        endTime: taskForm.endTime,
        description,
      };

      if (editingTaskId) {
        await updateDoc(
          doc(
            db,
            "users",
            userId,
            "ramadanPlannerTasks",
            editingTaskId
          ),
          {
            ...taskData,
            updatedAt: serverTimestamp(),
          }
        );

        setNotice("Task updated successfully.");
      } else {
        await addDoc(tasksCollection(userId), {
          ...taskData,
          completed: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setNotice("Task added successfully.");
      }

      closeTaskForm();

      // Reload tasks for the selected date.
      const snapshot = await getDocs(
        query(
          tasksCollection(userId),
          where("date", "==", selectedDate)
        )
      );

      const updatedTasks: PlannerTask[] = snapshot.docs.map(
        (item) => {
          const data = item.data();

          return {
            id: item.id,
            date: data.date ?? selectedDate,
            title: data.title ?? "",
            category: data.category ?? "other",
            startTime: data.startTime ?? "",
            endTime: data.endTime ?? "",
            description: data.description ?? "",
            completed: data.completed === true,
          };
        }
      );

      updatedTasks.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;

        return a.startTime.localeCompare(b.startTime);
      });

      setTasks(updatedTasks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the task."
      );
    } finally {
      setSavingTask(false);
    }
  }

  // =====================================================
  // TOGGLE TASK COMPLETION
  // =====================================================

  async function handleToggleTask(task: PlannerTask) {
    if (!user) return;

    const newStatus = !task.completed;

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: newStatus }
          : item
      )
    );

    try {
      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "ramadanPlannerTasks",
          task.id
        ),
        {
          completed: newStatus,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (err) {
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, completed: task.completed }
            : item
        )
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update task status."
      );
    }
  }

  // =====================================================
  // DELETE TASK
  // =====================================================

  async function handleDeleteTask(taskId: string) {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "ramadanPlannerTasks",
          taskId
        )
      );

      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      );

      if (editingTaskId === taskId) {
        closeTaskForm();
      }

      setNotice("Task deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the task."
      );
    }
  }

  // =====================================================
  // DATE NAVIGATION
  // =====================================================

  function goToPreviousDay() {
    setSelectedDate((current) => changeDate(current, -1));
  }

  function goToNextDay() {
    setSelectedDate((current) => changeDate(current, 1));
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="mx-auto w-full max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">

          {/* HEADER */}

          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                RAMADAN WORKSPACE
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Daily Ramadan Planner
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Organize your Suhoor, prayers, Quran reading, work,
                rest and Iftar throughout Ramadan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleHeaderAddTask}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              <Plus size={18} />
              {showTaskForm ? "Go to task form" : "Add task"}
            </button>
          </header>

          {/* MESSAGES */}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              {notice}
            </div>
          )}

          {/* DATE SELECTOR */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <CalendarDays size={23} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Daily schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousDay}
                  aria-label="Previous day"
                  className="rounded-xl border border-slate-300 p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronLeft size={19} />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    if (event.target.value) {
                      setSelectedDate(event.target.value);
                      setShowTaskForm(false);
                    }
                  }}
                  className="min-w-0 rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
                />

                <button
                  type="button"
                  onClick={goToNextDay}
                  aria-label="Next day"
                  className="rounded-xl border border-slate-300 p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(today);
                    setShowTaskForm(false);
                  }}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Today
                </button>
              </div>
            </div>
          </section>

          {/* STATISTICS */}

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Total tasks
                </p>
                <ListTodo className="text-emerald-700" size={21} />
              </div>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : tasks.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tasks planned for this day
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>
                <CheckCircle2 className="text-emerald-700" size={21} />
              </div>

              <p className="mt-3 text-3xl font-bold text-emerald-800">
                {loading ? "—" : completedTasks}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed activities
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>
                <Clock className="text-amber-600" size={21} />
              </div>

              <p className="mt-3 text-3xl font-bold text-amber-700">
                {loading ? "—" : pendingTasks}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Activities still to complete
              </p>
            </div>
          </section>

          {/* DAILY PROGRESS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">
                  Daily completion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your progress based on completed tasks.
                </p>
              </div>

              <p className="text-2xl font-bold text-emerald-700">
                {loading ? "—" : `${progress}%`}
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${loading ? 0 : progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {loading
                ? "Loading tasks..."
                : `${completedTasks} of ${tasks.length} tasks completed`}
            </p>
          </section>

          {/* DAILY INTENTION */}

          <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Daily intention
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set your intention and keep personal notes for the day.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Today's intention
                </span>

                <input
                  type="text"
                  maxLength={500}
                  value={intention}
                  onChange={(event) =>
                    setIntention(event.target.value)
                  }
                  placeholder="What do you want to focus on today?"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Personal notes
                </span>

                <textarea
                  rows={3}
                  maxLength={2000}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Write reminders, reflections or other notes..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDay}
                  disabled={savingDay || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingDay ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}

                  {savingDay ? "Saving..." : "Save daily plan"}
                </button>
              </div>
            </div>
          </section>

          {/* TASK FORM - AUTO SCROLL TARGET */}

          {showTaskForm && (
            <section
              ref={taskFormRef}
              id="ramadan-task-form"
              className="scroll-mt-8 rounded-2xl border-2 border-emerald-300 bg-white p-5 shadow-lg shadow-emerald-900/5 sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingTaskId ? "Edit task" : "Add your task"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(selectedDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeTaskForm}
                  aria-label="Close task form"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleTaskSubmit}
                className="space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Task title *
                    </span>

                    <input
                      required
                      autoFocus
                      maxLength={100}
                      value={taskForm.title}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          title: event.target.value,
                        })
                      }
                      placeholder="e.g. Read Quran"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Category *
                    </span>

                    <select
                      value={taskForm.category}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          category: event.target.value as PlannerCategory,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    >
                      {TASK_CATEGORIES.map((category) => (
                        <option
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Start time
                    </span>

                    <input
                      type="time"
                      value={taskForm.startTime}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          startTime: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      End time
                    </span>

                    <input
                      type="time"
                      value={taskForm.endTime}
                      onChange={(event) =>
                        setTaskForm({
                          ...taskForm,
                          endTime: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>

                  <textarea
                    rows={3}
                    maxLength={500}
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm({
                        ...taskForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Optional task details..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                  />
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingTask}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTask ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}

                    {savingTask
                      ? "Saving..."
                      : editingTaskId
                        ? "Update task"
                        : "Save task"}
                  </button>

                  <button
                    type="button"
                    onClick={closeTaskForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TASK LIST */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Today's schedule
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your activities for {formatDate(selectedDate)}.
                </p>
              </div>

              {!showTaskForm && tasks.length > 0 && (
                <button
                  type="button"
                  onClick={openAddTaskForm}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <Plus size={17} />
                  Add task
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={20} />
                Loading your schedule...
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <CalendarDays size={26} />
                </div>

                <h3 className="font-semibold text-slate-900">
                  No tasks planned yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Start organizing your day by adding Suhoor,
                  prayers, Quran reading, work, Iftar and other activities.
                </p>

                {!showTaskForm && (
                  <button
                    type="button"
                    onClick={openAddTaskForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
                  >
                    <Plus size={18} />
                    Add your first task
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className={`rounded-xl border p-4 transition ${
                      task.completed
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        aria-label={
                          task.completed
                            ? "Mark task as pending"
                            : "Mark task as completed"
                        }
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          task.completed
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-slate-300 text-transparent hover:border-emerald-600"
                        }`}
                      >
                        <Check size={15} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              task.completed
                                ? "text-emerald-900 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {getCategoryLabel(task.category)}
                          </span>

                          {task.completed && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                              Completed
                            </span>
                          )}
                        </div>

                        {(task.startTime || task.endTime) && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={14} />
                            {task.startTime || "Time not set"}
                            {task.endTime && ` – ${task.endTime}`}
                          </p>
                        )}

                        {task.description && (
                          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTaskForm(task)}
                          aria-label="Edit task"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label="Delete task"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* FOOTER */}

          <p className="text-xs leading-6 text-slate-500">
            Your daily planner is private to your account. Tasks are
            organized by the selected Gregorian date. Completing a
            planner task does not automatically update your prayer,
            fasting or Quran trackers.
          </p>
        </main>
      </div>
    </div>
  );
}
