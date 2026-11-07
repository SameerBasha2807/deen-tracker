
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Edit3,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  saveUserGoal,
  deleteUserGoal,
  type UserGoal,
  type GoalTrackingMode,
} from "@/lib/goals";

import type {
  GoalCategory,
  GoalPeriod,
  GoalTrackingType,
  GoalUnit,
} from "@/lib/types";

interface GoalActionsProps {
  goal: UserGoal;
}

interface TrackingOption {
  value: GoalTrackingType;
  label: string;
  unit: GoalUnit;
}

const categories: {
  value: GoalCategory;
  label: string;
}[] = [
  { value: "prayer", label: "Prayer" },
  { value: "quran", label: "Quran" },
  { value: "dhikr", label: "Dhikr" },
  { value: "fasting", label: "Fasting" },
  { value: "charity", label: "Charity" },
  { value: "learning", label: "Islamic Learning" },
];

const periods: {
  value: GoalPeriod;
  label: string;
}[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const trackingOptions: Record<
  GoalCategory,
  TrackingOption[]
> = {
  prayer: [
    {
      value: "prayer",
      label: "Complete prayers",
      unit: "prayers",
    },
  ],

  quran: [
    {
      value: "quran_pages",
      label: "Read Quran pages",
      unit: "pages",
    },
    {
      value: "quran_surahs",
      label: "Complete Surahs",
      unit: "surahs",
    },
    {
      value: "quran_juz",
      label: "Complete Juz",
      unit: "juz",
    },
  ],

  dhikr: [
    {
      value: "dhikr",
      label: "Complete Dhikr",
      unit: "times",
    },
  ],

  fasting: [
    {
      value: "fasting",
      label: "Fasting days",
      unit: "days",
    },
  ],

  charity: [
    {
      value: "charity",
      label: "Charity / Sadaqah",
      unit: "times",
    },
  ],

  learning: [
    {
      value: "learning",
      label: "Islamic learning",
      unit: "items",
    },
  ],
};

export default function GoalActions({
  goal,
}: GoalActionsProps) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(
    goal.description ?? ""
  );
  const [category, setCategory] =
    useState<GoalCategory>(goal.category);
  const [period, setPeriod] =
    useState<GoalPeriod>(goal.period);
  const [trackingType, setTrackingType] =
    useState<GoalTrackingType>(goal.trackingType);
  const [trackingMode, setTrackingMode] =
    useState<GoalTrackingMode>(goal.trackingMode);
  const [target, setTarget] = useState(
    String(goal.target)
  );
  const [unit, setUnit] = useState<GoalUnit>(goal.unit);

  // Reload form values when the edit dialog opens.
  useEffect(() => {
    if (!open) return;

    setTitle(goal.title);
    setDescription(goal.description ?? "");
    setCategory(goal.category);
    setPeriod(goal.period);
    setTrackingType(goal.trackingType);
    setTrackingMode(goal.trackingMode);
    setTarget(String(goal.target));
    setUnit(goal.unit);
    setError("");
  }, [open, goal]);

  function notifyGoalChanges() {
    window.dispatchEvent(new Event("goals-data-updated"));
    window.dispatchEvent(new Event("goal-data-updated"));
  }

  function handleCategoryChange(value: GoalCategory) {
    setCategory(value);

    const firstOption = trackingOptions[value][0];

    setTrackingType(firstOption.value);
    setUnit(firstOption.unit);
  }

  function handleTrackingChange(value: GoalTrackingType) {
    setTrackingType(value);

    const option = trackingOptions[category].find(
      (item) => item.value === value
    );

    if (option) setUnit(option.unit);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || saving) return;

    const cleanTitle = title.trim();
    const numericTarget = Number(target);

    if (!cleanTitle) {
      setError("Goal name is required.");
      return;
    }

    if (
      !Number.isFinite(numericTarget) ||
      numericTarget <= 0
    ) {
      setError("Target must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedGoal: UserGoal = {
        ...goal,
        title: cleanTitle,
        description: description.trim() || undefined,
        category,
        period,
        trackingType,
        trackingMode,
        target: numericTarget,
        unit,
        updatedAt: Date.now(),
      };

      await saveUserGoal(user.uid, updatedGoal);

      setOpen(false);
      notifyGoalChanges();
    } catch (error) {
      console.error("Could not update goal:", error);
      setError("Could not update this goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || deleting) return;

    const confirmed = window.confirm(
      `Delete "${goal.title}"? This will permanently remove this goal.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await deleteUserGoal(user.uid, goal.id);

      notifyGoalChanges();
    } catch (error) {
      console.error("Could not delete goal:", error);
      setError("Could not delete this goal. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const options = trackingOptions[category];

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="Edit goal"
          aria-label={`Edit ${goal.title}`}
          className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/20"
        >
          <Edit3 size={14} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={deleting}
          title="Delete goal"
          aria-label={`Delete ${goal.title}`}
          className="flex items-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#26364B] bg-[#07111F] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26364B] p-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Goal
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Modify your goal details and target.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close edit goal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Goal name
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={120}
                  className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(event) =>
                      handleCategoryChange(
                        event.target.value as GoalCategory
                      )
                    }
                    className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-3 py-3 text-white outline-none focus:border-emerald-500"
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Goal period
                  </label>

                  <select
                    value={period}
                    onChange={(event) =>
                      setPeriod(event.target.value as GoalPeriod)
                    }
                    className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-3 py-3 text-white outline-none focus:border-emerald-500"
                  >
                    {periods.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  What should be tracked?
                </label>

                <select
                  value={trackingType}
                  onChange={(event) =>
                    handleTrackingChange(
                      event.target.value as GoalTrackingType
                    )
                  }
                  className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  {options.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Target
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={target}
                    onChange={(event) =>
                      setTarget(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Unit
                  </label>

                  <input
                    value={unit}
                    readOnly
                    className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Progress tracking
                </label>

                <select
                  value={trackingMode}
                  onChange={(event) =>
                    setTrackingMode(
                      event.target.value as GoalTrackingMode
                    )
                  }
                  className="w-full rounded-xl border border-[#26364B] bg-[#0A1624] px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  <option value="automatic">
                    Automatic
                  </option>
                  <option value="manual">
                    Manual
                  </option>
                </select>
              </div>

              {error && (
                <p role="alert" className="text-sm text-rose-400">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-[#26364B] pt-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-[#26364B] px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
