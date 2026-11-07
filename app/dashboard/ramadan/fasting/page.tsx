"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import RamadanSeasonActions from "@/app/components/dashboard/RamadanSeasonActions";

import Link from "next/link";

import {

  ArrowLeft,

  MoonStar,

  CalendarDays,

  CheckCircle2,

  Circle,

  Clock,

  Plus,

  Loader2,

  Save,

  Trash2,

  BookOpen,

  X,

} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";

import TopBar from "@/app/components/dashboard/TopBar";

import { useAuth } from "@/contexts/AuthContext";

import {

  createRamadanSeason,

  getRamadanSeasons,

  getFastingDays,

  getRamadanDayDate,

  saveFastingDay,

  clearFastingDay,

  type RamadanSeason,

  type FastingDayRecord,

  type FastingStatus,

} from "@/lib/ramadan-fasting";

function formatDate(date: string): string {

  return new Date(

    `${date}T00:00:00`

  ).toLocaleDateString(undefined, {

    day: "numeric",

    month: "short",

    year: "numeric",

  });

}

function formatShortDate(date: string): string {

  return new Date(

    `${date}T00:00:00`

  ).toLocaleDateString(undefined, {

    day: "numeric",

    month: "short",

  });

}

function getStatusStyles(

  status?: FastingStatus

) {

  switch (status) {

    case "completed":

      return {

        card: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",

        label: "Completed",

      };

    case "missed":

      return {

        card: "border-red-500/40 bg-red-500/10 text-red-300",

        label: "Missed",

      };

    case "exempt":

      return {

        card: "border-amber-500/40 bg-amber-500/10 text-amber-300",

        label: "Exempt",

      };

    default:

      return {

        card: "border-slate-700 bg-slate-900/60 text-slate-400",

        label: "Not recorded",

      };

  }

}

export default function FastingTrackerPage() {

  const { user, loading: authLoading } = useAuth();

  const [seasons, setSeasons] = useState<RamadanSeason[]>([]);

  const [activeSeasonId, setActiveSeasonId] = useState("");

  const [days, setDays] = useState<

    Record<number, FastingDayRecord>

  >({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [hijriYear, setHijriYear] = useState("");

  const [startDate, setStartDate] = useState("");

  const [totalDays, setTotalDays] = useState<29 | 30>(30);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [selectedStatus, setSelectedStatus] =

    useState<FastingStatus | "unrecorded">("completed");

  const [selectedNote, setSelectedNote] = useState("");

  const activeSeason = useMemo(

    () =>

      seasons.find(

        (season) => season.id === activeSeasonId

      ) ?? null,

    [seasons, activeSeasonId]

  );

  const loadSeasons = useCallback(async () => {

    if (!user) {

      return;

    }

    try {

      setLoading(true);

      setError("");

      const result = await getRamadanSeasons(user.uid);

      setSeasons(result);

      setActiveSeasonId((previous) => {

        if (

          previous &&

          result.some((season) => season.id === previous)

        ) {

          return previous;

        }

        return result[0]?.id ?? "";

      });

    } catch (error) {

      console.error("Ramadan seasons error:", error);

      setError(

        "Unable to load your Ramadan history."

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

    void loadSeasons();

  }, [user, authLoading, loadSeasons]);

  useEffect(() => {

    if (!user || !activeSeason) {

      setDays({});

      return;

    }

    let active = true;

    async function loadDays() {

      try {

        setLoading(true);

        setError("");

        const result = await getFastingDays(

          user!.uid,

          activeSeason!.id

        );

        if (!active) return;

        const mapped: Record<number, FastingDayRecord> = {};

        result.forEach((record) => {

          mapped[record.dayNumber] = record;

        });

        setDays(mapped);

      } catch (error) {

        console.error("Fasting logs error:", error);

        if (active) {

          setError(

            "Unable to load fasting records."

          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }

      }

    }

    void loadDays();

    return () => {

      active = false;

    };

  }, [user, activeSeason]);

  async function handleCreateSeason(

    event: React.FormEvent<HTMLFormElement>

  ) {

    event.preventDefault();

    if (!user) return;

    try {

      setSaving(true);

      setError("");

      setSuccess("");

      const year = Number(hijriYear);

      const newSeason = await createRamadanSeason(

        user.uid,

        year,

        startDate,

        totalDays

      );

      setSeasons((previous) =>

        [...previous, newSeason].sort(

          (a, b) => b.hijriYear - a.hijriYear

        )

      );

      setActiveSeasonId(newSeason.id);

      setDays({});

      setHijriYear("");

      setStartDate("");

      setTotalDays(30);

      setShowCreateForm(false);

      setSuccess(

        `Ramadan ${year} has been created successfully.`

      );

    } catch (error) {

      console.error("Create Ramadan error:", error);

      setError(

        error instanceof Error

          ? error.message

          : "Unable to create Ramadan season."

      );

    } finally {

      setSaving(false);

    }

  }

  function openDayEditor(dayNumber: number) {

    const record = days[dayNumber];

    setSelectedDay(dayNumber);

    setSelectedStatus(

      record?.status ?? "completed"

    );

    setSelectedNote(

      record?.note ?? ""

    );

    setError("");

  }

  async function handleSaveDay() {

    if (

      !user ||

      !activeSeason ||

      selectedDay === null

    ) {

      return;

    }

    try {

      setSaving(true);

      setError("");

      setSuccess("");

      if (selectedStatus === "unrecorded") {

        await clearFastingDay(

          user.uid,

          activeSeason.id,

          selectedDay

        );

        setDays((previous) => {

          const updated = { ...previous };

          delete updated[selectedDay!];

          return updated;

        });

      } else {

        await saveFastingDay(

          user.uid,

          activeSeason,

          selectedDay,

          selectedStatus,

          selectedNote

        );

        setDays((previous) => ({

          ...previous,

          [selectedDay!]: {

            dayNumber: selectedDay!,

            date: getRamadanDayDate(

              activeSeason.startDate,

              selectedDay!

            ),

            status: selectedStatus,

            note: selectedNote.trim(),

            updatedAt: Date.now(),

          },

        }));

      }

      setSelectedDay(null);

      setSuccess("Fasting record saved successfully.");

    } catch (error) {

      console.error("Save fasting day error:", error);

      setError(

        error instanceof Error

          ? error.message

          : "Unable to save fasting record."

      );

    } finally {

      setSaving(false);

    }

  }

  const records = Object.values(days);

  const completed = records.filter(

    (item) => item.status === "completed"

  ).length;

  const missed = records.filter(

    (item) => item.status === "missed"

  ).length;

  const exempt = records.filter(

    (item) => item.status === "exempt"

  ).length;

  const unrecorded = activeSeason

    ? activeSeason.totalDays - records.length

    : 0;

  const completionPercentage = activeSeason

    ? Math.round(

        (completed / activeSeason.totalDays) * 100

      )

    : 0;

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

  return (

    <main className="flex min-h-screen bg-[#020914] text-white">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <TopBar />

        <div className="space-y-8 p-4 sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <Link

                href="/"

                className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"

              >

                <ArrowLeft size={17} />

                Back to Home

              </Link>

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">

                  <MoonStar

                    size={30}

                    className="text-amber-300"

                  />

                </div>

                <div>

                  <h1 className="text-2xl font-bold sm:text-3xl">

                    Fasting Tracker

                  </h1>

                  <p className="mt-1 text-sm text-slate-400">

                    Your Ramadan fasting journey.

                  </p>

                </div>

              </div>

            </div>

            <button

              type="button"

              onClick={() => setShowCreateForm(!showCreateForm)}

              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"

            >

              <Plus size={18} />

              Add Ramadan Year

            </button>

          </div>

          {error && (

            <div

              role="alert"

              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"

            >

              {error}

            </div>

          )}

          {success && (

            <div

              role="status"

              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"

            >

              {success}

            </div>

          )}

          {showCreateForm && (

            <section className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">

                    Create Ramadan Season

                  </h2>

                  <p className="mt-1 text-sm text-slate-400">

                    Add a new year without changing previous records.

                  </p>

                </div>

                <button

                  type="button"

                  aria-label="Close form"

                  onClick={() => setShowCreateForm(false)}

                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"

                >

                  <X size={20} />

                </button>

              </div>

              <form

                onSubmit={handleCreateSeason}

                className="grid gap-5 md:grid-cols-3"

              >

                <div>

                  <label

                    htmlFor="hijri-year"

                    className="mb-2 block text-sm font-medium text-slate-300"

                  >

                    Hijri Year

                  </label>

                  <input

                    id="hijri-year"

                    type="number"

                    required

                    min="1300"

                    max="1600"

                    value={hijriYear}

                    onChange={(e) =>

                      setHijriYear(e.target.value)

                    }

                    placeholder="Example: 1448"

                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"

                  />

                </div>

                <div>

                  <label

                    htmlFor="ramadan-start"

                    className="mb-2 block text-sm font-medium text-slate-300"

                  >

                    First day of Ramadan

                  </label>

                  <input

                    id="ramadan-start"

                    type="date"

                    required

                    value={startDate}

                    onChange={(e) =>

                      setStartDate(e.target.value)

                    }

                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"

                  />

                  <p className="mt-2 text-xs text-slate-500">

                    Enter the locally confirmed start date.

                  </p>

                </div>

                <div>

                  <label

                    htmlFor="ramadan-days"

                    className="mb-2 block text-sm font-medium text-slate-300"

                  >

                    Number of Ramadan days

                  </label>

                  <select

                    id="ramadan-days"

                    value={totalDays}

                    onChange={(e) =>

                      setTotalDays(

                        Number(e.target.value) as 29 | 30

                      )

                    }

                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"

                  >

                    <option value={29}>29 Days</option>

                    <option value={30}>30 Days</option>

                  </select>

                </div>

                <div className="md:col-span-3">

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

                      <Plus size={18} />

                    )}

                    Create Ramadan Season

                  </button>

                </div>

              </form>

            </section>

          )}

          {loading && seasons.length === 0 && (

            <div className="flex min-h-[250px] items-center justify-center gap-3 text-slate-400">

              <Loader2

                size={22}

                className="animate-spin"

              />

              Loading Ramadan history...

            </div>

          )}

          {!loading && seasons.length === 0 && (

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">

              <CalendarDays

                size={44}

                className="mx-auto text-amber-300"

              />

              <h2 className="mt-5 text-xl font-bold">

                Start Your Ramadan Journey

              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">

                Create your first Ramadan season to track

                your fasts and preserve your journey year after year.

              </p>

              <button

                type="button"

                onClick={() => setShowCreateForm(true)}

                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"

              >

                Create First Ramadan Season

              </button>

            </div>

          )}

          {activeSeason && (

            <>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                  <BookOpen className="text-amber-300" />

                  <div>

                    <h2 className="font-semibold">

                      Ramadan History

                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                      Select a year to view its records.

                    </p>

                  </div>

                  </div>

                  <select

                    value={activeSeasonId}

                    onChange={(e) =>

                      setActiveSeasonId(e.target.value)

                    }

                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 sm:w-auto"

                  >

                    {seasons.map((season) => (

                      <option

                        key={season.id}

                        value={season.id}

                      >

                        Ramadan {season.hijriYear} AH

                      </option>

                    ))}

                  </select>

                </div>

                {activeSeason && (
                  <div className="mt-4 flex justify-end">
                    <RamadanSeasonActions season={activeSeason} />
                  </div>
                )}

              </section>

              <section className="overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-[#16231F] via-[#111D24] to-[#111827] p-6 sm:p-8">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <div className="flex items-center gap-2 text-amber-300">

                      <MoonStar size={22} />

                      <span className="text-sm font-semibold">

                        Your Ramadan Journey

                      </span>

                    </div>

                    <h2 className="mt-3 text-3xl font-bold text-white">

                      Ramadan {activeSeason.hijriYear} AH

                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                      {formatDate(activeSeason.startDate)}

                      {" — "}

                      {formatDate(

                        getRamadanDayDate(

                          activeSeason.startDate,

                          activeSeason.totalDays

                        )

                      )}

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      {activeSeason.totalDays} days

                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-sm text-slate-400">

                      Fasting completion

                    </p>

                    <p className="mt-1 text-4xl font-bold text-emerald-400">

                      {completionPercentage}%

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      {completed} of {activeSeason.totalDays} days completed

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

              <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">

                <SummaryCard

                  title="Completed"

                  value={completed}

                  description="Successfully fasted"

                  color="emerald"

                  icon={<CheckCircle2 size={21} />}

                />

                <SummaryCard

                  title="Missed"

                  value={missed}

                  description="Not completed"

                  color="red"

                  icon={<Clock size={21} />}

                />

                <SummaryCard

                  title="Exempt"

                  value={exempt}

                  description="Marked as exempt"

                  color="amber"

                  icon={<CalendarDays size={21} />}

                />

                <SummaryCard

                  title="Unrecorded"

                  value={unrecorded}

                  description="Awaiting an entry"

                  color="slate"

                  icon={<Circle size={21} />}

                />

              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">

                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-xl font-bold">

                      Ramadan Calendar

                    </h2>

                    <p className="mt-1 text-sm text-slate-400">

                      Select a day to record your fasting status.

                    </p>

                  </div>

                  <span className="text-xs text-slate-500">

                    {activeSeason.totalDays} days

                  </span>

                </div>

                {loading ? (

                  <div className="flex min-h-[200px] items-center justify-center gap-3 text-slate-400">

                    <Loader2 className="animate-spin" />

                    Loading fasting records...

                  </div>

                ) : (

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-10">

                    {Array.from(

                      { length: activeSeason.totalDays },

                      (_, index) => index + 1

                    ).map((dayNumber) => {

                      const record = days[dayNumber];

                      const statusStyles =

                        getStatusStyles(record?.status);

                      const date = getRamadanDayDate(

                        activeSeason.startDate,

                        dayNumber

                      );

                      return (

                        <button

                          key={dayNumber}

                          type="button"

                          onClick={() =>

                            openDayEditor(dayNumber)

                          }

                          className={`

                            group

                            flex

                            min-h-[105px]

                            flex-col

                            items-center

                            justify-center

                            gap-2

                            rounded-2xl

                            border

                            p-3

                            transition-all

                            duration-200

                            hover:-translate-y-1

                            hover:border-emerald-400/50

                            ${statusStyles.card}

                          `}

                        >

                          <span className="text-xs opacity-70">

                            Day

                          </span>

                          <span className="text-2xl font-bold">

                            {dayNumber}

                          </span>

                          <span className="text-[11px] opacity-80">

                            {formatShortDate(date)}

                          </span>

                          <span className="text-[10px] font-semibold">

                            {statusStyles.label}

                          </span>

                        </button>

                      );

                    })}

                  </div>

                )}

                <div className="mt-7 flex flex-wrap gap-4 border-t border-white/5 pt-5">

                  <Legend color="bg-emerald-500" label="Completed" />

                  <Legend color="bg-red-500" label="Missed" />

                  <Legend color="bg-amber-500" label="Exempt" />

                  <Legend color="bg-slate-600" label="Unrecorded" />

                </div>

              </section>

              <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">

                    <CalendarDays size={24} />

                  </div>

                  <div>

                    {/* QADA FASTING */}

<Link
  href="/dashboard/ramadan/qada"
  className="group block"
>
  <section className="flex flex-col gap-4 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-[#17251F] to-[#111D27] p-6 transition-all duration-300 hover:border-amber-400/50 hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">

    <div className="flex items-center gap-4">

      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
        <CalendarDays size={27} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-white">
          Qada Fasting
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Manage outstanding fasts and track completed make-up fasts.
        </p>
      </div>

    </div>

    <div className="flex items-center gap-3">

      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
        Open Qada Tracker
      </span>

      <span className="text-xl text-slate-500 transition group-hover:translate-x-1 group-hover:text-amber-300">
        →
      </span>

    </div>

  </section>
</Link>

                    <p className="mt-1 text-sm text-slate-400">

                      Manage outstanding and completed make-up fasts.

                    </p>

                  </div>

                </div>

                <span className="w-fit rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">

                  Next implementation

                </span>

              </section>

            </>

          )}

        </div>

      </div>

      {selectedDay !== null && activeSeason && (

        <div

          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"

          onMouseDown={(e) => {

            if (e.target === e.currentTarget && !saving) {

              setSelectedDay(null);

            }

          }}

        >

          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#101B27] p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-amber-300">

                  Ramadan {activeSeason.hijriYear} AH

                </p>

                <h2 className="mt-1 text-2xl font-bold">

                  Day {selectedDay}

                </h2>

                <p className="mt-1 text-sm text-slate-400">

                  {formatDate(

                    getRamadanDayDate(

                      activeSeason.startDate,

                      selectedDay

                    )

                  )}

                </p>

              </div>

              <button

                type="button"

                aria-label="Close"

                disabled={saving}

                onClick={() => setSelectedDay(null)}

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"

              >

                <X size={21} />

              </button>

            </div>

            <div className="mt-7 space-y-3">

              <p className="text-sm font-semibold text-slate-300">

                Select fasting status

              </p>

              <StatusOption

                active={selectedStatus === "completed"}

                color="emerald"

                title="Completed"

                description="I successfully completed this fast."

                onClick={() =>

                  setSelectedStatus("completed")

                }

              />

              <StatusOption

                active={selectedStatus === "missed"}

                color="red"

                title="Missed"

                description="I did not complete this fast."

                onClick={() =>

                  setSelectedStatus("missed")

                }

              />

              <StatusOption

                active={selectedStatus === "exempt"}

                color="amber"

                title="Exempt"

                description="Mark this day as exempt."

                onClick={() =>

                  setSelectedStatus("exempt")

                }

              />

              <StatusOption

                active={selectedStatus === "unrecorded"}

                color="slate"

                title="Clear record"

                description="Remove the saved status for this day."

                onClick={() =>

                  setSelectedStatus("unrecorded")

                }

              />

            </div>

            {selectedStatus !== "unrecorded" && (

              <div className="mt-6">

                <label

                  htmlFor="fasting-note"

                  className="mb-2 block text-sm font-medium text-slate-300"

                >

                  Personal note (optional)

                </label>

                <textarea

                  id="fasting-note"

                  rows={3}

                  maxLength={500}

                  value={selectedNote}

                  onChange={(e) =>

                    setSelectedNote(e.target.value)

                  }

                  placeholder="Add a private note..."

                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"

                />

                <p className="mt-1 text-right text-xs text-slate-500">

                  {selectedNote.length}/500

                </p>

              </div>

            )}

            <div className="mt-6 flex gap-3">

              <button

                type="button"

                disabled={saving}

                onClick={() =>

                  setSelectedDay(null)

                }

                className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"

              >

                Cancel

              </button>

              <button

                type="button"

                disabled={saving}

                onClick={handleSaveDay}

                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"

              >

                {saving ? (

                  <Loader2

                    size={17}

                    className="animate-spin"

                  />

                ) : selectedStatus === "unrecorded" ? (

                  <Trash2 size={17} />

                ) : (

                  <Save size={17} />

                )}

                {selectedStatus === "unrecorded"

                  ? "Clear"

                  : "Save Status"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>

  );

}

function SummaryCard({

  title,

  value,

  description,

  color,

  icon,

}: {

  title: string;

  value: number;

  description: string;

  color: "emerald" | "red" | "amber" | "slate";

  icon: React.ReactNode;

}) {

  const styles = {

    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    red: "border-red-500/20 bg-red-500/10 text-red-400",

    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",

    slate: "border-slate-700 bg-slate-800/60 text-slate-300",

  };

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">

      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${styles[color]}`}>

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

function Legend({

  color,

  label,

}: {

  color: string;

  label: string;

}) {

  return (

    <div className="flex items-center gap-2">

      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

      <span className="text-xs text-slate-400">

        {label}

      </span>

    </div>

  );

}

function StatusOption({

  active,

  color,

  title,

  description,

  onClick,

}: {

  active: boolean;

  color: "emerald" | "red" | "amber" | "slate";

  title: string;

  description: string;

  onClick: () => void;

}) {

  const colors = {

    emerald: "border-emerald-500/40 bg-emerald-500/10",

    red: "border-red-500/40 bg-red-500/10",

    amber: "border-amber-500/40 bg-amber-500/10",

    slate: "border-slate-500/40 bg-slate-500/10",

  };

  return (

    <button

      type="button"

      onClick={onClick}

      className={`

        flex

        w-full

        items-center

        gap-3

        rounded-xl

        border

        p-3

        text-left

        transition

        ${

          active

            ? colors[color]

            : "border-slate-700 bg-slate-950/50 hover:border-slate-500"

        }

      `}

    >

      <span className={active ? "text-emerald-400" : "text-slate-500"}>

        {active

          ? <CheckCircle2 size={21} />

          : <Circle size={21} />

        }

      </span>

      <span>

        <span className="block text-sm font-semibold text-white">

          {title}

        </span>

        <span className="mt-1 block text-xs text-slate-400">

          {description}

        </span>

      </span>

    </button>

  );

}
