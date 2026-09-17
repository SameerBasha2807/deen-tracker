"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Target,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  createGoal,
  type CreateGoalInput,
} from "@/lib/goals";

import type {
  GoalCategory,
  GoalPeriod,
  GoalTrackingType,
  GoalUnit,
} from "@/lib/types";

interface CreateGoalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const categories: {
  value: GoalCategory;
  label: string;
}[] = [
  {
    value: "prayer",
    label: "Prayer",
  },
  {
    value: "quran",
    label: "Quran",
  },
  {
    value: "dhikr",
    label: "Dhikr",
  },
  {
    value: "fasting",
    label: "Fasting",
  },
  {
    value: "charity",
    label: "Charity",
  },
  {
    value: "learning",
    label: "Islamic Learning",
  },
];

const periods: {
  value: GoalPeriod;
  label: string;
}[] = [
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
];

function getTrackingOptions(
  category: GoalCategory
): {
  value: GoalTrackingType;
  label: string;
  unit: GoalUnit;
}[] {
  switch (category) {
    case "prayer":
      return [
        {
          value: "prayer",
          label: "Complete prayers",
          unit: "prayers",
        },
      ];

    case "quran":
      return [
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
      ];

    case "dhikr":
      return [
        {
          value: "dhikr",
          label: "Complete Dhikr",
          unit: "times",
        },
      ];

    case "fasting":
      return [
        {
          value: "fasting",
          label: "Fast",
          unit: "days",
        },
      ];

    case "charity":
      return [
        {
          value: "charity",
          label: "Charity / Sadaqah",
          unit: "times",
        },
      ];

    case "learning":
      return [
        {
          value: "learning",
          label: "Islamic learning",
          unit: "items",
        },
      ];

    default:
      return [];
  }
}

export default function CreateGoal({
  open,
  onClose,
  onCreated,
}: CreateGoalProps) {
  const { user } = useAuth();

  const [category, setCategory] =
    useState<GoalCategory>("prayer");

  const [period, setPeriod] =
    useState<GoalPeriod>("daily");

  const trackingOptions =
    getTrackingOptions(category);

  const [trackingType, setTrackingType] =
    useState<GoalTrackingType>(
      trackingOptions[0].value
    );

  const [unit, setUnit] =
    useState<GoalUnit>(
      trackingOptions[0].unit
    );

  const [title, setTitle] =
    useState("");

  const [target, setTarget] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [trackingMode, setTrackingMode] =
    useState<
      "automatic" | "manual"
    >("automatic");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  if (!open) {
    return null;
  }

  function handleCategoryChange(
    value: GoalCategory
  ) {
    setCategory(value);

    const options =
      getTrackingOptions(value);

    if (options.length > 0) {
      setTrackingType(
        options[0].value
      );

      setUnit(
        options[0].unit
      );
    }
  }

  function handleTrackingChange(
    value: GoalTrackingType
  ) {
    setTrackingType(value);

    const option =
      trackingOptions.find(
        (item) =>
          item.value === value
      );

    if (option) {
      setUnit(option.unit);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!user) {
      setError(
        "Please sign in before creating a goal."
      );

      return;
    }

    const cleanTitle =
      title.trim();

    const numericTarget =
      Number(target);

    if (!cleanTitle) {
      setError(
        "Please enter a goal name."
      );

      return;
    }

    if (
      !Number.isFinite(
        numericTarget
      ) ||
      numericTarget <= 0
    ) {
      setError(
        "Target must be greater than 0."
      );

      return;
    }

    try {
      setSaving(true);

      const input: CreateGoalInput = {
        title: cleanTitle,

        category,

        period,

        trackingType,

        unit,

        target: numericTarget,

        trackingMode,

        ...(description.trim()
          ? {
              description:
                description.trim(),
            }
          : {}),
      };

      await createGoal(
        user.uid,
        input
      );

      setTitle("");
      setTarget("");
      setDescription("");

      setError(null);

      onCreated?.();

      onClose();
    } catch (error) {
      console.error(
        "Could not create goal:",
        error
      );

      setError(
        "Could not create your goal. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#172235] bg-[#07111F] shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-[#172235] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Create Goal
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Create a personal goal for your DeenTracker journey.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* Category */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Goal Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                handleCategoryChange(
                  event.target.value as GoalCategory
                )
              }
              className="w-full rounded-xl border border-[#172235] bg-[#0A1624] px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            >
              {categories.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Period */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Goal Period
            </label>

            <div className="grid grid-cols-3 gap-3">
              {periods.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setPeriod(
                        item.value
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      period ===
                      item.value
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[#172235] bg-[#0A1624] text-slate-300 hover:border-emerald-500/50"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Goal name */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Goal Name
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Read 5 Quran pages"
              className="w-full rounded-xl border border-[#172235] bg-[#0A1624] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500"
            />
          </div>

          {/* Tracking */}

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
              className="w-full rounded-xl border border-[#172235] bg-[#0A1624] px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            >
              {trackingOptions.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Target */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Target
            </label>

            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={target}
                onChange={(event) =>
                  setTarget(
                    event.target.value
                  )
                }
                placeholder="5"
                className="flex-1 rounded-xl border border-[#172235] bg-[#0A1624] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500"
              />

              <div className="flex min-w-28 items-center justify-center rounded-xl border border-[#172235] bg-[#0A1624] px-4 text-sm text-slate-400">
                {unit}
              </div>
            </div>
          </div>

          {/* Tracking mode */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Progress Tracking
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setTrackingMode(
                    "automatic"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  trackingMode ===
                  "automatic"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-[#172235] bg-[#0A1624]"
                }`}
              >
                <p className="font-medium text-white">
                  Automatic
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Calculate progress from your DeenTracker activity.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setTrackingMode(
                    "manual"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  trackingMode ===
                  "manual"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-[#172235] bg-[#0A1624]"
                }`}
              >
                <p className="font-medium text-white">
                  Manual
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  You manually record progress.
                </p>
              </button>

            </div>
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
              <span className="ml-2 text-xs text-slate-500">
                Optional
              </span>
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={3}
              placeholder="Add a short note about this goal..."
              className="w-full resize-none rounded-xl border border-[#172235] bg-[#0A1624] px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500"
            />
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-3 border-t border-[#172235] pt-6">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#172235] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />

              {saving
                ? "Creating..."
                : "Create Goal"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}