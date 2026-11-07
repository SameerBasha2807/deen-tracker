"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Check,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  addQuranTemplate,
  deleteQuranTemplate,
  getQuranTemplateCompletion,
  getQuranTemplates,
  saveQuranTemplateCompletion,
  type QuranTemplate,
  type QuranTemplateType,
} from "@/lib/quran";

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

type TemplateWithCompletion =
  QuranTemplate & {
    completed: boolean;
  };

export default function SurahTracker() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [date, setDate] =
    useState(todayLocalDate());

  const [templates, setTemplates] =
    useState<TemplateWithCompletion[]>(
      []
    );

  const [routineName, setRoutineName] =
    useState("");

  const [type, setType] =
    useState<QuranTemplateType>(
      "surah"
    );

  const [content, setContent] =
    useState("");

  const [count, setCount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState<string | null>(null);

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     DETECT NEW DAY
  ===================================================== */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        const currentDate =
          todayLocalDate();

        setDate(
          (previousDate) => {
            if (
              previousDate !==
              currentDate
            ) {
              return currentDate;
            }

            return previousDate;
          }
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);/* =====================================================
   LOAD USER TEMPLATES + TODAY'S COMPLETION
===================================================== */

useEffect(() => {
  if (authLoading) {
    return;
  }

  if (!user) {
    setTemplates([]);
    setLoading(false);
    setError("");
    return;
  }

  const currentUser = user;
  let active = true;

  async function loadTemplates() {
    try {
      setLoading(true);
      setError("");

      const storedTemplates =
        await getQuranTemplates(
          currentUser.uid
        );

      const templatesWithCompletion =
        await Promise.all(
          storedTemplates.map(
            async (template) => {
              const completed =
                await getQuranTemplateCompletion(
                  currentUser.uid,
                  date,
                  template.id
                );

              return {
                ...template,
                completed,
              };
            }
          )
        );

      if (!active) {
        return;
      }

      setTemplates(
        templatesWithCompletion
      );
    } catch (error) {
      console.error(
        "Could not load Quran templates:",
        error
      );

      if (active) {
        setTemplates([]);

        setError(
          "Could not load your Quran routines. Please try again."
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  void loadTemplates();

  return () => {
    active = false;
  };
}, [
  user,
  authLoading,
  date,
]);

  async function handleAddRoutine(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedRoutineName =
      routineName.trim();

    const trimmedContent =
      content.trim();

    if (!trimmedRoutineName) {
      setError(
        "Please enter a routine name."
      );
      return;
    }

    if (!trimmedContent) {
      setError(
        type === "surah"
          ? "Please enter a Surah name."
          : "Please enter a Dhikr."
      );
      return;
    }

    let dhikrCount:
      | number
      | undefined;

    if (type === "dhikr") {
      const parsedCount =
        Number(count);

      if (
        !Number.isInteger(
          parsedCount
        ) ||
        parsedCount <= 0
      ) {
        setError(
          "Dhikr count must be greater than zero."
        );
        return;
      }

      dhikrCount =
        parsedCount;
    }

    try {
      setAdding(true);
      setError("");

      const newTemplate =
        await addQuranTemplate(
          user.uid,
          trimmedRoutineName,
          type,
          trimmedContent,
          dhikrCount
        );

      setTemplates(
        (current) => [
          ...current,
          {
            ...newTemplate,
            completed: false,
          },
        ]
      );

      setRoutineName("");
      setContent("");
      setCount("");
      setType("surah");
      setShowAddForm(false);

      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not add Quran routine:",
        error
      );

      setError(
        "Could not add this routine. Please try again."
      );
    } finally {
      setAdding(false);
    }
  }

  /* =====================================================
     TOGGLE COMPLETION
  ===================================================== */

  async function toggleRoutine(
    template: TemplateWithCompletion
  ) {
    if (
      !user ||
      saving !== null ||
      deleting !== null
    ) {
      return;
    }

    const nextCompleted =
      !template.completed;

    try {
      setSaving(
        template.id
      );

      setError("");

      await saveQuranTemplateCompletion(
        user.uid,
        date,
        template.id,
        nextCompleted
      );

      setTemplates(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              template.id
                ? {
                    ...item,
                    completed:
                      nextCompleted,
                  }
                : item
          )
      );

      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not save routine completion:",
        error
      );

      setError(
        "Could not save this routine. Please try again."
      );
    } finally {
      setSaving(null);
    }
  }

  /* =====================================================
     DELETE ROUTINE
  ===================================================== */

  async function handleDeleteRoutine(
    templateId: string
  ) {
    if (!user) {
      return;
    }

    try {
      setDeleting(
        templateId
      );

      setError("");

      await deleteQuranTemplate(
        user.uid,
        templateId
      );

      setTemplates(
        (current) =>
          current.filter(
            (template) =>
              template.id !==
              templateId
          )
      );

      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not delete Quran routine:",
        error
      );

      setError(
        "Could not delete this routine."
      );
    } finally {
      setDeleting(null);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    authLoading ||
    loading
  ) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-400">
        Loading your Quran routines...
      </section>
    );
  }

  /* =====================================================
     NOT SIGNED IN
  ===================================================== */

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-300">
        Please sign in to manage your Quran routines.
      </section>
    );
  }

  /* =====================================================
     COUNTS
  ===================================================== */

  const completedCount =
    templates.filter(
      (template) =>
        template.completed
    ).length;

  const surahCount =
    templates.filter(
      (template) =>
        template.type ===
        "surah"
    ).length;

  const dhikrCount =
    templates.filter(
      (template) =>
        template.type ===
        "dhikr"
    ).length;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 shadow-sm sm:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-sm font-medium text-emerald-400">
            Today's Quran routines
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            Surah & Dhikr Tracker
          </h2>

          <p className="mt-2 text-slate-400">
            Track the Surahs and Dhikr you read from your physical Quran and practice.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-center">
          <p className="text-sm text-emerald-200">
            Completed today
          </p>

          <p className="text-3xl font-bold text-emerald-400">
            {completedCount}/
            {templates.length}
          </p>
        </div>

      </div>

      {/* SUMMARY */}

      {templates.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="rounded-2xl border border-[#172235] bg-[#081522] p-4">
            <p className="text-xs text-slate-400">
              Surahs
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              {surahCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#172235] bg-[#081522] p-4">
            <p className="text-xs text-slate-400">
              Dhikr
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              {dhikrCount}
            </p>
          </div>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* ADD BUTTON */}

      <button
        type="button"
        onClick={() =>
          setShowAddForm(
            (value) => !value
          )
        }
        className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600"
      >
        <Plus size={18} />

        {showAddForm
          ? "Close"
          : "Add Routine"}
      </button>

      {/* ADD FORM */}

      {showAddForm && (
        <form
          onSubmit={
            handleAddRoutine
          }
          className="mt-4 rounded-2xl border border-[#172235] bg-[#081522] p-5"
        >

          {/* TYPE */}

          <div>
            <label
              htmlFor="routine-type"
              className="block text-sm font-medium text-slate-300"
            >
              Type
            </label>

            <select
              id="routine-type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as QuranTemplateType
                )
              }
              className="mt-2 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={adding}
            >
              <option value="surah">
                Surah
              </option>

              <option value="dhikr">
                Dhikr
              </option>
            </select>
          </div>

          {/* ROUTINE NAME */}

          <div className="mt-4">
            <label
              htmlFor="routine-name"
              className="block text-sm font-medium text-slate-300"
            >
              Routine name
            </label>

            <input
              id="routine-name"
              type="text"
              value={routineName}
              onChange={(event) =>
                setRoutineName(
                  event.target.value
                )
              }
              placeholder={
                type === "surah"
                  ? "e.g. After Maghrib"
                  : "e.g. After Isha"
              }
              className="mt-2 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={adding}
            />
          </div>

          {/* CONTENT */}

          <div className="mt-4">
            <label
              htmlFor="routine-content"
              className="block text-sm font-medium text-slate-300"
            >
              {type === "surah"
                ? "Surah"
                : "Dhikr"}
            </label>

            <input
              id="routine-content"
              type="text"
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder={
                type === "surah"
                  ? "e.g. Surah Al-Waqiah"
                  : "e.g. Astaghfirullah"
              }
              className="mt-2 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={adding}
            />
          </div>

          {/* DHIKR COUNT */}

          {type === "dhikr" && (
            <div className="mt-4">
              <label
                htmlFor="dhikr-count"
                className="block text-sm font-medium text-slate-300"
              >
                Count
              </label>

              <input
                id="dhikr-count"
                type="number"
                min="1"
                step="1"
                value={count}
                onChange={(event) =>
                  setCount(
                    event.target.value
                  )
                }
                placeholder="e.g. 100"
                className="mt-2 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
                disabled={adding}
              />
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={adding}
            className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding
              ? "Creating..."
              : "Create Routine"}
          </button>

        </form>
      )}

      {/* EMPTY */}

      {templates.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#25344A] bg-[#081522] p-8 text-center">

          <p className="font-medium text-white">
            No routines added yet.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Create your own Surah or Dhikr routine above.
          </p>

        </div>
      ) : (

        /* ROUTINE LIST */

        <div className="mt-6 space-y-3">

          {templates.map(
            (template) => (
              <div
                key={template.id}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                  template.completed
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-[#172235] bg-[#081522]"
                }`}
              >

                {/* TOGGLE */}

                <button
                  type="button"
                  onClick={() =>
                    void toggleRoutine(
                      template
                    )
                  }
                  disabled={
                    saving !== null ||
                    deleting !== null
                  }
                  className="flex min-w-0 flex-1 items-center gap-4 text-left disabled:opacity-60"
                >

                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      template.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {template.completed ? (
                      <Check size={21} />
                    ) : (
                      <Circle size={21} />
                    )}
                  </span>

                  <span className="min-w-0">

                    <span className="block text-xs font-medium uppercase tracking-wide text-emerald-400">
                      {template.type ===
                      "surah"
                        ? "Surah"
                        : "Dhikr"}
                    </span>

                    <span className="mt-1 block font-semibold text-white">
                      {template.name}
                    </span>

                    <span className="mt-1 block text-sm text-slate-300">
                      {template.type ===
                      "surah"
                        ? template.surahName
                        : template.dhikrName}
                    </span>

                    {template.type ===
                      "dhikr" &&
                      template.count && (
                        <span className="mt-1 block text-xs text-slate-400">
                          {template.count} times
                        </span>
                      )}

                    <span className="mt-1 block text-xs text-slate-400">
                      {saving ===
                      template.id
                        ? "Saving..."
                        : template.completed
                        ? "Completed today"
                        : "Mark complete today"}
                    </span>

                  </span>

                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    void handleDeleteRoutine(
                      template.id
                    )
                  }
                  disabled={
                    deleting !== null ||
                    saving !== null
                  }
                  className="rounded-xl p-3 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40"
                  aria-label={`Delete ${template.name}`}
                >
                  <Trash2 size={18} />
                </button>

              </div>
            )
          )}

        </div>

      )}

    </section>
  );
}