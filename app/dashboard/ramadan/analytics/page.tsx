
"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Loader2,
  MoonStar,
  RefreshCw,
  Target,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRamadanAnalytics,
  type RamadanAnalytics,
} from "@/lib/ramadan-analytics";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-emerald-50 p-3 text-emerald-700">
          {icon}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color = "bg-emerald-600",
  detail,
}: {
  label: string;
  value: number;
  total: number;
  color?: string;
  detail?: string;
}) {
  const percent = percentage(value, total);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-900">
          {detail ?? `${value} / ${total}`}
          {!detail && (
            <span className="ml-2 text-xs font-medium text-slate-400">
              {percent}%
            </span>
          )}
        </span>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const charityLabels: Record<string, string> = {
  sadaqah: "Sadaqah",
  zakat: "Zakat",
  fitr: "Zakat al-Fitr",
  fidya: "Fidya",
  kaffarah: "Kaffarah",
  iftar: "Iftar / Food",
  mosque: "Mosque / Community",
  other: "Other",
};

export default function RamadanAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] =
    useState<RamadanAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (userId: string) => {
    const result = await getRamadanAnalytics(userId);
    setAnalytics(result);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setAnalytics(null);
      setError("Please sign in to view your Ramadan analytics.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getRamadanAnalytics(user!.uid);

        if (!cancelled) {
          setAnalytics(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load Ramadan analytics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleRefresh() {
    if (!user) return;

    try {
      setRefreshing(true);
      setError("");

      await loadAnalytics(user.uid);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh Ramadan analytics."
      );
    } finally {
      setRefreshing(false);
    }
  }

  const fastingRate = analytics
    ? percentage(
        analytics.fasting.completed,
        analytics.fasting.completed + analytics.fasting.missed
      )
    : 0;

  const qadaRate = analytics
    ? percentage(
        analytics.qada.completed,
        analytics.qada.required
      )
    : 0;

  const plannerRate = analytics
    ? percentage(
        analytics.planner.completedTasks,
        analytics.planner.totalTasks
      )
    : 0;

  const juzRate = analytics
    ? percentage(analytics.quran.completedJuz, 30)
    : 0;

  const oddNightRate = analytics
    ? percentage(
        analytics.lastTenNights.oddNightsTracked,
        5
      )
    : 0;

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

              <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                <Activity size={30} className="text-emerald-700" />
                Ramadan Analytics
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Your Ramadan activity overview, bringing together
                your saved progress across all Ramadan modules.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing || !user}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh analytics
            </button>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
              <Loader2 size={22} className="animate-spin" />
              Calculating your Ramadan analytics...
            </div>
          ) : analytics ? (
            <>
              {/* OVERALL METRICS */}

              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    Your Ramadan at a glance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Totals calculated from your saved records.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard
                    title="Completed fasts"
                    value={analytics.fasting.completed}
                    subtitle={`${analytics.fasting.missed} missed · ${analytics.fasting.exempt} exempt`}
                    icon={<CalendarCheck size={21} />}
                  />

                  <MetricCard
                    title="Qada fasts remaining"
                    value={analytics.qada.remaining}
                    subtitle={`${analytics.qada.completed} of ${analytics.qada.required} recorded as completed`}
                    icon={<Target size={21} />}
                  />

                  <MetricCard
                    title="Quran pages logged"
                    value={analytics.quran.pagesRead.toLocaleString("en-IN")}
                    subtitle={`${analytics.quran.readings} reading records · ${analytics.quran.goals} goals`}
                    icon={<BookOpen size={21} />}
                  />

                  <MetricCard
                    title="Planner tasks completed"
                    value={analytics.planner.completedTasks}
                    subtitle={`${analytics.planner.pendingTasks} pending · ${analytics.planner.daysPlanned} planned days`}
                    icon={<CalendarDays size={21} />}
                  />

                  <MetricCard
                    title="Charitable contributions"
                    value={formatCurrency(analytics.charity.totalAmount)}
                    subtitle={`${analytics.charity.donations} donation records`}
                    icon={<HeartHandshake size={21} />}
                  />

                  <MetricCard
                    title="Last 10 nights tracked"
                    value={analytics.lastTenNights.nightsTracked}
                    subtitle={`${analytics.lastTenNights.activitiesCompleted} worship activities recorded`}
                    icon={<MoonStar size={21} />}
                  />
                </div>
              </section>

              {/* PROGRESS SECTIONS */}

              <section className="grid gap-6 lg:grid-cols-2">
                {/* FASTING */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                      <CalendarCheck size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Fasting progress
                      </h2>
                      <p className="text-xs text-slate-500">
                        Across {analytics.fasting.seasons} saved Ramadan season(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <ProgressRow
                      label="Completed vs completed + missed"
                      value={analytics.fasting.completed}
                      total={
                        analytics.fasting.completed +
                        analytics.fasting.missed
                      }
                      color="bg-emerald-600"
                      detail={`${fastingRate}%`}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs text-emerald-700">
                          Completed
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-900">
                          {analytics.fasting.completed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-xs text-red-700">Missed</p>
                        <p className="mt-1 text-xl font-bold text-red-900">
                          {analytics.fasting.missed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-xs text-amber-700">Exempt</p>
                        <p className="mt-1 text-xl font-bold text-amber-900">
                          {analytics.fasting.exempt}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs leading-5 text-slate-500">
                      Exempt days are excluded from the completed-versus-missed
                      percentage.
                    </p>
                  </div>
                </div>

                {/* QADA */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                      <CheckCircle2 size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Qada fasting progress
                      </h2>
                      <p className="text-xs text-slate-500">
                        Your saved make-up fasting obligations
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <ProgressRow
                      label="Completed Qada fasts"
                      value={analytics.qada.completed}
                      total={analytics.qada.required}
                      color="bg-blue-600"
                      detail={`${qadaRate}%`}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-blue-50 p-4">
                        <p className="text-xs text-blue-700">
                          Completed
                        </p>
                        <p className="mt-1 text-2xl font-bold text-blue-950">
                          {analytics.qada.completed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50 p-4">
                        <p className="text-xs text-amber-700">
                          Remaining
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-950">
                          {analytics.qada.remaining}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      {analytics.qada.obligations} obligations ·{" "}
                      {analytics.qada.completionRecords} completion records
                    </p>
                  </div>
                </div>

                {/* QURAN */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                      <BookOpen size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Quran Khatam progress
                      </h2>
                      <p className="text-xs text-slate-500">
                        Recorded Quran reading activity
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-violet-50 p-4">
                        <p className="text-xs text-violet-700">
                          Pages logged
                        </p>
                        <p className="mt-1 text-2xl font-bold text-violet-950">
                          {analytics.quran.pagesRead.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-indigo-50 p-4">
                        <p className="text-xs text-indigo-700">
                          Reading records
                        </p>
                        <p className="mt-1 text-2xl font-bold text-indigo-950">
                          {analytics.quran.readings}
                        </p>
                      </div>
                    </div>

                    <ProgressRow
                      label="Distinct Juz marked complete"
                      value={analytics.quran.completedJuz}
                      total={30}
                      color="bg-violet-600"
                      detail={`${juzRate}%`}
                    />

                    <p className="text-xs text-slate-500">
                      {analytics.quran.goals} Khatam goal(s) created.
                      Page totals are calculated from saved Khatam reading
                      records.
                    </p>
                  </div>
                </div>

                {/* PLANNER */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
                      <CalendarDays size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Daily planner activity
                      </h2>
                      <p className="text-xs text-slate-500">
                        Tasks saved in your Ramadan planner
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <ProgressRow
                      label="Tasks completed"
                      value={analytics.planner.completedTasks}
                      total={analytics.planner.totalTasks}
                      color="bg-cyan-600"
                      detail={`${plannerRate}%`}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-cyan-50 p-4">
                        <p className="text-xs text-cyan-700">
                          Completed
                        </p>
                        <p className="mt-1 text-2xl font-bold text-cyan-950">
                          {analytics.planner.completedTasks}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-4">
                        <p className="text-xs text-slate-600">
                          Pending
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {analytics.planner.pendingTasks}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Planner entries across {analytics.planner.daysPlanned} day(s).
                    </p>
                  </div>
                </div>

                {/* CHARITY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-rose-50 p-3 text-rose-700">
                      <HeartHandshake size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Charity overview
                      </h2>
                      <p className="text-xs text-slate-500">
                        All contribution records
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-3xl font-bold text-slate-900">
                    {formatCurrency(analytics.charity.totalAmount)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {analytics.charity.donations} donations recorded
                  </p>

                  {analytics.charity.categories.length === 0 ? (
                    <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      Your charity category breakdown will appear here
                      when you record donations.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {analytics.charity.categories.map((category) => {
                        const share = percentage(
                          category.amount,
                          analytics.charity.totalAmount
                        );

                        return (
                          <div key={category.name}>
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                {charityLabels[category.name] ?? category.name}
                              </span>

                              <span className="text-sm font-semibold text-slate-900">
                                {formatCurrency(category.amount)}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-rose-500"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* LAST TEN NIGHTS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                      <MoonStar size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Last 10 Nights activity
                      </h2>
                      <p className="text-xs text-slate-500">
                        Your saved worship and reflection records
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <ProgressRow
                      label="Odd nights with records"
                      value={analytics.lastTenNights.oddNightsTracked}
                      total={5}
                      color="bg-amber-500"
                      detail={`${oddNightRate}%`}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-amber-50 p-4">
                        <p className="text-xs text-amber-700">
                          Nights tracked
                        </p>
                        <p className="mt-1 text-2xl font-bold text-amber-950">
                          {analytics.lastTenNights.nightsTracked}
                          <span className="text-sm font-medium text-amber-700">
                            {" "}/ 10
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-700">
                          Activities recorded
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-950">
                          {analytics.lastTenNights.activitiesCompleted}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      An odd night counts as tracked when it has at least
                      one saved activity or a saved reflection.
                    </p>
                  </div>
                </div>
              </section>

              {/* FOOTER NOTE */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <Clock
                    size={20}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      About these analytics
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      These figures are calculated from records saved in
                      your Ramadan modules. They reflect logged activity,
                      not a judgment of the quality or acceptance of worship.
                      Quran pages are summed from Khatam reading records;
                      Qada and fasting totals are based on their respective
                      tracker entries. Refresh the dashboard to retrieve
                      the latest saved data.
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Activity
                className="mx-auto text-slate-400"
                size={30}
              />

              <h2 className="mt-3 font-semibold text-slate-900">
                Analytics are not available
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in and refresh the page to load your Ramadan records.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
