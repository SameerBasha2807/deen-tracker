"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CircleDollarSign,
  Gift,
  HandCoins,
  HeartHandshake,
  Landmark,
  Loader2,
  MoonStar,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { useAppStore } from "@/stores/useAppStore";

import type { CharityRecord } from "@/lib/types";

import {
  addCharityRecord,
  deleteCharityRecord,
  getCharityRecords,
} from "@/lib/charity";

interface CharityTrackerProps {
  userId: string;
}

/* =====================================================
   HELPERS
===================================================== */

function getLocalDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">
          {label}
        </p>

        <Icon
          size={20}
          className={iconClass}
        />
      </div>

      <h3
        className={`mt-3 text-3xl font-bold ${iconClass}`}
      >
        $
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h3>
    </div>
  );
}

/* =====================================================
   CATEGORY CARD
===================================================== */

function CategoryCard({
  title,
  amount,
  icon: Icon,
}: {
  title: string;
  amount: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition-all duration-200 hover:border-emerald-500/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Icon
            size={18}
            className="text-emerald-400"
          />
        </div>

        <span className="font-semibold text-slate-300">
          {title}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        $
        {amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function CharityTracker({
  userId,
}: CharityTrackerProps) {
  const {
    charity,
    charityMath,
    setCharity,
    recalcCharity,
  } = useAppStore();

  const [amount, setAmount] = useState("");
  const [category, setCategory] =
    useState<CharityRecord["category"]>("sadaqah");

  const [note, setNote] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =====================================================
     LOAD USER-SPECIFIC CHARITY
  ===================================================== */

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        /*
         * IMPORTANT:
         * Records are loaded using the authenticated
         * user's UID.
         *
         * Therefore every user sees only their own
         * charity records.
         */
        const records =
          await getCharityRecords(userId);

        if (!active) {
          return;
        }

        setCharity(records);
        recalcCharity(records);
      } catch (err) {
        console.error(
          "Failed to load charity records:",
          err
        );

        if (active) {
          setError(
            "Could not load your charity records. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      active = false;
    };
  }, [
    userId,
    setCharity,
    recalcCharity,
  ]);

  /* =====================================================
     CATEGORY TOTALS
  ===================================================== */

  const categoryTotals = useMemo(() => {
    const totals: Record<
      CharityRecord["category"],
      number
    > = {
      sadaqah: 0,
      zakat: 0,
      fitrah: 0,
      fidya: 0,
      other: 0,
    };

    charity.forEach((record) => {
      totals[record.category] += record.amount;
    });

    return totals;
  }, [charity]);

  /* =====================================================
     ADD CHARITY
  ===================================================== */

  const handleAdd = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    const numericAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter a valid amount greater than 0."
      );

      return;
    }

    setSubmitting(true);

    try {
      const cleanNote = note.trim();

      /*
       * IMPORTANT:
       * Firestore does NOT accept undefined.
       *
       * Therefore note is only included when
       * the user actually entered one.
       */
      const recordData: Omit<
        CharityRecord,
        "id"
      > = {
        userId,
        amount: numericAmount,
        date: getLocalDate(),
        category,
        createdAt: Date.now(),
        ...(cleanNote
          ? { note: cleanNote }
          : {}),
      };

      const newRecord =
        await addCharityRecord(
          userId,
          recordData
        );

      const updatedRecords = [
        newRecord,
        ...charity,
      ];

      setCharity(updatedRecords);
      recalcCharity(updatedRecords);

      setAmount("");
      setNote("");
      setCategory("sadaqah");
    } catch (err) {
      console.error(
        "Failed to add charity:",
        err
      );

      setError(
        "Could not save your donation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DELETE CHARITY
  ===================================================== */

  const handleDelete = async (
    record: CharityRecord
  ) => {
    if (!record.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this charity record?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(record.id);
    setError(null);

    try {
      /*
       * Delete using both userId and record ID.
       *
       * This keeps the operation user-specific.
       */
      await deleteCharityRecord(
        userId,
        record.id
      );

      const updatedRecords =
        charity.filter(
          (item) => item.id !== record.id
        );

      setCharity(updatedRecords);
      recalcCharity(updatedRecords);
    } catch (err) {
      console.error(
        "Failed to delete charity:",
        err
      );

      setError(
        "Could not delete this charity record. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     CATEGORY LABEL
  ===================================================== */

  const formatCategory = (
    value: CharityRecord["category"]
  ) => {
    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">
      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today"
          value={charityMath.today}
          icon={CircleDollarSign}
          iconClass="text-emerald-400"
        />

        <StatCard
          label="This Week"
          value={charityMath.thisWeek}
          icon={HeartHandshake}
          iconClass="text-sky-400"
        />

        <StatCard
          label="This Month"
          value={charityMath.thisMonth}
          icon={Gift}
          iconClass="text-amber-400"
        />

        <StatCard
          label="All Time"
          value={charityMath.allTime}
          icon={HandCoins}
          iconClass="text-purple-400"
        />
      </div>

      {/* =================================================
          CATEGORY BREAKDOWN
      ================================================= */}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Charity by Category
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            See how much you have given in each
            category.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <CategoryCard
            title="Sadaqah"
            amount={categoryTotals.sadaqah}
            icon={HandCoins}
          />

          <CategoryCard
            title="Zakat"
            amount={categoryTotals.zakat}
            icon={Landmark}
          />

          <CategoryCard
            title="Fitrah"
            amount={categoryTotals.fitrah}
            icon={Gift}
          />

          <CategoryCard
            title="Fidya"
            amount={categoryTotals.fidya}
            icon={MoonStar}
          />

          <CategoryCard
            title="Other"
            amount={categoryTotals.other}
            icon={CircleDollarSign}
          />
        </div>
      </section>

      {/* =================================================
          FORM + HISTORY
      ================================================= */}

      <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
        {/* =================================================
            ADD FORM
        ================================================= */}

        <section className="h-fit rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <HandCoins
                className="text-emerald-400"
                size={24}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Record Charity
              </h2>

              <p className="text-sm text-slate-500">
                Add a charity contribution.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAdd}
            className="space-y-5"
          >
            {/* Amount */}
            <div>
              <label
                htmlFor="charity-amount"
                className="mb-2 block text-sm font-medium text-slate-400"
              >
                Amount
              </label>

              <input
                id="charity-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="charity-category"
                className="mb-2 block text-sm font-medium text-slate-400"
              >
                Category
              </label>

              <select
                id="charity-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as CharityRecord["category"]
                  )
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-white outline-none transition focus:border-emerald-500"
              >
                <option value="sadaqah">
                  Sadaqah
                </option>

                <option value="zakat">
                  Zakat
                </option>

                <option value="fitrah">
                  Fitrah
                </option>

                <option value="fidya">
                  Fidya
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="charity-note"
                className="mb-2 block text-sm font-medium text-slate-400"
              >
                Note{" "}
                <span className="text-slate-600">
                  (optional)
                </span>
              </label>

              <input
                id="charity-note"
                type="text"
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                placeholder="E.g. Masjid donation"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Plus size={18} />
              )}

              {submitting
                ? "Saving..."
                : "Add Donation"}
            </button>
          </form>
        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="space-y-6">
          {/* =================================================
              RECENT DONATIONS
          ================================================= */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                Recent Donations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your charity records.
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Loading your records...
              </div>
            )}

            {!loading &&
              charity.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <HandCoins
                    size={32}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-3 text-slate-500">
                    No donations recorded yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Start recording your charity.
                  </p>
                </div>
              )}

            {!loading &&
              charity.length > 0 && (
                <div className="space-y-3">
                  {charity
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-emerald-500/30"
                      >
                        {/* Left */}
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                            <HandCoins
                              size={18}
                              className="text-emerald-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold capitalize text-white">
                              {formatCategory(
                                item.category
                              )}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {item.date}

                              {item.note
                                ? ` • ${item.note}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex shrink-0 items-center gap-4">
                          <span className="text-lg font-bold text-emerald-400">
                            $
                            {item.amount.toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(
                                item
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            title="Delete donation"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-500 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            item.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
          </div>

          {/* =================================================
              DAILY TOTALS
          ================================================= */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">
                Daily Totals
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your charity contribution by day.
              </p>
            </div>

            {charityMath.dailyHistory
              .length === 0 ? (
              <p className="py-8 text-center text-slate-600">
                No daily charity data yet.
              </p>
            ) : (
              <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                {charityMath.dailyHistory.map(
                  (day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                    >
                      <span className="text-sm text-slate-400">
                        {day.date}
                      </span>

                      <span className="font-bold text-white">
                        $
                        {day.total.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}