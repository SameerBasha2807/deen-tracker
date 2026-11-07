
"use client";

import { useState } from "react";
import { Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteRamadanSeason,
  updateRamadanSeason,
  type RamadanSeason,
} from "@/lib/ramadan-fasting";

interface RamadanSeasonActionsProps {
  season: RamadanSeason;
}

export default function RamadanSeasonActions({
  season,
}: RamadanSeasonActionsProps) {
  const { user } = useAuth();

  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [hijriYear, setHijriYear] = useState(String(season.hijriYear));
  const [startDate, setStartDate] = useState(season.startDate);
  const [totalDays, setTotalDays] = useState<"29" | "30">(
    String(season.totalDays) as "29" | "30"
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openEdit() {
    setHijriYear(String(season.hijriYear));
    setStartDate(season.startDate);
    setTotalDays(String(season.totalDays) as "29" | "30");
    setError("");
    setMode("edit");
  }

  async function handleUpdate() {
    if (!user) {
      setError("Please log in again.");
      return;
    }

    const year = Number(hijriYear);

    if (!Number.isInteger(year) || year < 1300 || year > 1600) {
      setError("Enter a valid Hijri year between 1300 and 1600.");
      return;
    }

    if (!startDate) {
      setError("Please select the first day of Ramadan.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateRamadanSeason(user.uid, season.id, {
        hijriYear: year,
        startDate,
        totalDays: Number(totalDays) as 29 | 30,
      });

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update the Ramadan season."
      );
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) {
      setError("Please log in again.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteRamadanSeason(user.uid, season.id);
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete the Ramadan season."
      );
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300"
        >
          <Pencil size={15} />
          Edit Year
        </button>

        <button
          type="button"
          onClick={() => {
            setError("");
            setMode("delete");
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-300 transition hover:border-red-500 hover:bg-red-500/10"
        >
          <Trash2 size={15} />
          Delete Year
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setMode(null);
              setError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ramadan-season-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="ramadan-season-dialog-title"
                  className="text-xl font-semibold text-white"
                >
                  {mode === "edit" ? "Edit Ramadan Year" : "Delete Ramadan Year"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Ramadan {season.hijriYear} AH
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setMode(null);
                  setError("");
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            {mode === "edit" ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ramadan-hijri-year"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Hijri Year
                  </label>

                  <input
                    id="ramadan-hijri-year"
                    type="number"
                    min="1300"
                    max="1600"
                    value={hijriYear}
                    onChange={(e) => setHijriYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ramadan-start-date"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    First Day of Ramadan
                  </label>

                  <input
                    id="ramadan-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Existing day records will be assigned dates based on this
                    start date.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="ramadan-total-days"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Number of Days
                  </label>

                  <select
                    id="ramadan-total-days"
                    value={totalDays}
                    onChange={(e) =>
                      setTotalDays(e.target.value as "29" | "30")
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
                  >
                    <option value="29">29 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setMode(null)}
                    className="rounded-lg px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleUpdate}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5 flex gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-4">
                  <AlertTriangle
                    size={22}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <div>
                    <p className="font-medium text-red-200">
                      Permanently delete this Ramadan year?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-200/70">
                      All fasting records and private notes saved under
                      Ramadan {season.hijriYear} AH will also be deleted.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="mb-4 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setMode(null)}
                    className="rounded-lg px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
