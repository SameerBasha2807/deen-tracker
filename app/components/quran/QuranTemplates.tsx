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

export default function QuranTemplates() {
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

  const [type, setType] =
    useState<QuranTemplateType>(
      "surah"
    );

  const [routineName, setRoutineName] =
    useState("");

  const [content, setContent] =
    useState("");

  const [count, setCount] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /* =====================================================
     MIDNIGHT RESET
  ===================================================== */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        const currentDate =
          todayLocalDate();

        setDate((previousDate) => {
          if (
            previousDate !==
            currentDate
          ) {
            return currentDate;
          }

          return previousDate;
        });
      }, 1000);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  /* =====================================================
     LOAD TEMPLATES
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
  if (!user) {
    return;
  }

  try {
        setLoading(true);
        setError("");

        const saved =
          await getQuranTemplates(
            user.uid
          );

        const withCompletion =
          await Promise.all(
            saved.map(
              async (template) => ({
                ...template,
                completed:
                  await getQuranTemplateCompletion(
                    user.uid,
                    date,
                    template.id
                  ),
              })
            )
          );

        if (active) {
          setTemplates(
            withCompletion
          );
        }
      } catch (error) {
        console.error(
          "Could not load templates:",
          error
        );

        if (active) {
          setError(
            "Could not load your routines."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [
    user,
    authLoading,
    date,
  ]);

  /* =====================================================
     ADD TEMPLATE
  ===================================================== */

  async function handleAdd(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedRoutine =
      routineName.trim();

    const trimmedContent =
      content.trim();

    if (!trimmedRoutine) {
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
      dhikrCount = Number(count);

      if (
        !Number.isInteger(
          dhikrCount
        ) ||
        dhikrCount <= 0
      ) {
        setError(
          "Enter a valid Dhikr count."
        );
        return;
      }
    }

    try {
      setAdding(true);
      setError("");

      const newTemplate =
        await addQuranTemplate(
          user.uid,
          trimmedRoutine,
          type,
          trimmedContent,
          dhikrCount
        );

      setTemplates((current) => [
        ...current,
        {
          ...newTemplate,
          completed: false,
        },
      ]);

      setRoutineName("");
      setContent("");
      setCount("");
      setShowForm(false);

      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not add template:",
        error
      );

      setError(
        "Could not create this routine. Please try again."
      );
    } finally {
      setAdding(false);
    }
  }

  /* =====================================================
     TOGGLE
  ===================================================== */

  async function toggleTemplate(
    template: TemplateWithCompletion
  ) {
    if (
      !user ||
      saving !== null ||
      deleting !== null
    ) {
      return;
    }

    const next =
      !template.completed;

    try {
      setSaving(template.id);
      setError("");

      await saveQuranTemplateCompletion(
        user.uid,
        date,
        template.id,
        next
      );

      setTemplates((current) =>
        current.map((item) =>
          item.id === template.id
            ? {
                ...item,
                completed: next,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Could not save completion:",
        error
      );

      setError(
        "Could not save this item."
      );
    } finally {
      setSaving(null);
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function handleDelete(
    templateId: string
  ) {
    if (!user) {
      return;
    }

    try {
      setDeleting(templateId);
      setError("");

      await deleteQuranTemplate(
        user.uid,
        templateId
      );

      setTemplates((current) =>
        current.filter(
          (item) =>
            item.id !== templateId
        )
      );
    } catch (error) {
      console.error(
        "Could not delete template:",
        error
      );

      setError(
        "Could not delete this item."
      );
    } finally {
      setDeleting(null);
    }
  }

  /* =====================================================
     STATES
  ===================================================== */

  if (
    authLoading ||
    loading
  ) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-400">
        Loading your routines...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-300">
        Please sign in to manage your Quran routines.
      </section>
    );
  }

  const completed =
    templates.filter(
      (item) => item.completed
    ).length;

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 shadow-sm sm:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-sm font-medium text-emerald-400">
            Daily worship routines
          </p>

          <h2 className="mt-1 text-3xl font-bold text-white">
            Quran & Dhikr Templates
          </h2>

          <p className="mt-2 text-slate-400">
            Create your own Surah and Dhikr routines.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-500/10 px-5 py-4 text-center">
          <p className="text-sm text-emerald-200">
            Completed today
          </p>

          <p className="text-3xl font-bold text-emerald-400">
            {completed}/{templates.length}
          </p>
        </div>

      </div>

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
          setShowForm(
            (value) => !value
          )
        }
        className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600"
      >
        <Plus size={18} />

        {showForm
          ? "Close"
          : "Create Routine"}
      </button>

      {/* FORM */}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-4 rounded-2xl border border-[#172235] bg-[#081522] p-5"
        >

          {/* TYPE */}

          <div>
            <label
              htmlFor="template-type"
              className="block text-sm font-medium text-slate-300"
            >
              Type
            </label>

            <select
              id="template-type"
              value={type}
              onChange={(event) => {
                const next =
                  event.target.value as QuranTemplateType;

                setType(next);
                setContent("");
                setCount("");
              }}
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

          {/* ROUTINE */}

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
                  : "e.g. After Fajr"
              }
              className="mt-2 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={adding}
            />
          </div>

          {/* CONTENT */}

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="template-content"
                className="block text-sm font-medium text-slate-300"
              >
                {type === "surah"
                  ? "Surah"
                  : "Dhikr"}
              </label>

              <input
                id="template-content"
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

            {/* COUNT ONLY FOR DHIKR */}

            {type === "dhikr" && (
              <div>
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

          </div>

          {/* CREATE */}

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
            Add a Surah or Dhikr routine you want to track.
          </p>
        </div>
      ) : (

        /* LIST */

        <div className="mt-6 space-y-3">

          {templates.map(
            (template) => {

              const title =
                template.type ===
                "surah"
                  ? template.surahName
                  : template.dhikrName;

              const subtitle =
                template.type ===
                "dhikr" &&
                template.count
                  ? `${template.count} times`
                  : "Surah";

              return (
                <div
                  key={template.id}
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                    template.completed
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-[#172235] bg-[#081522]"
                  }`}
                >

                  {/* CHECK */}

                  <button
                    type="button"
                    onClick={() =>
                      void toggleTemplate(
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

                      <span className="block font-semibold text-white">
                        {template.name}
                      </span>

                      <span className="block text-sm text-slate-300">
                        {title}
                      </span>

                      <span className="block text-xs text-slate-500">
                        {subtitle}
                      </span>

                      <span className="text-xs text-slate-400">
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
                      void handleDelete(
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
              );
            }
          )}

        </div>
      )}

    </section>
  );
}