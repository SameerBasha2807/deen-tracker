
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  MoonStar,
  CalendarDays,
  BookOpen,
  Clock,
  Heart,
  BarChart3,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getRamadanMode,
  saveRamadanMode,
} from "@/lib/ramadan";

/* =====================================================
   RAMADAN MODULES
===================================================== */

const ramadanModules = [
  {
    title: "Fasting Tracker",
    description: "Track your daily fasts.",
    icon: CalendarDays,
  },
  {
    title: "Quran Khatam",
    description: "Plan and track Quran completion.",
    icon: BookOpen,
  },
  {
    title: "Daily Planner",
    description: "Organize your Ramadan routine.",
    icon: Clock,
  },
  {
    title: "Charity Tracker",
    description: "Track Sadaqah and charity.",
    icon: Heart,
  },
  {
    title: "Last 10 Nights",
    description: "Plan your final ten nights.",
    icon: MoonStar,
  },
  {
    title: "Ramadan Analytics",
    description: "Review your Ramadan progress.",
    icon: BarChart3,
  },
];

/* =====================================================
   RAMADAN OS COMPONENT
===================================================== */

export default function RamadanOSCard() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [enabled, setEnabled] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD USER PREFERENCE
  ===================================================== */

  const loadRamadanMode = useCallback(
    async () => {
      if (!user) {
        setEnabled(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const status = await getRamadanMode(
          user.uid
        );

        setEnabled(status);

      } catch (error) {
        console.error(
          "Failed to load Ramadan Mode:",
          error
        );

        setError(
          "Unable to load Ramadan Mode."
        );

      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadRamadanMode();

  }, [
    authLoading,
    loadRamadanMode,
  ]);

  /* =====================================================
     TOGGLE RAMADAN MODE
  ===================================================== */

  async function handleToggle() {
    if (!user || saving || loading) {
      return;
    }

    const newStatus = !enabled;

    try {
      setSaving(true);
      setError("");

      await saveRamadanMode(
        user.uid,
        newStatus
      );

      setEnabled(newStatus);

    } catch (error) {
      console.error(
        "Failed to update Ramadan Mode:",
        error
      );

      setError(
        "Unable to update Ramadan Mode. Please try again."
      );

    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     AUTHENTICATION
  ===================================================== */

  if (authLoading || !user) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-[#4B3B22]
        bg-gradient-to-br
        from-[#171A22]
        via-[#121924]
        to-[#10201F]
        p-6
        shadow-lg
        shadow-black/20
      "
    >

      {/* Background Decoration */}
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-56
          w-56
          rounded-full
          bg-amber-400/10
          blur-3xl
        "
      />

      <div className="relative">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-amber-400/20
                bg-amber-400/10
              "
            >
              <MoonStar
                size={29}
                className="text-amber-300"
              />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-2xl font-bold text-white">
                  RamadanOS
                </h2>

                <span
                  className="
                    rounded-full
                    border
                    border-amber-400/20
                    bg-amber-400/10
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-amber-300
                  "
                >
                  Your Ramadan Companion
                </span>

              </div>

              <p className="mt-1 text-sm text-slate-400">
                Prepare, plan and make your Ramadan meaningful.
              </p>

            </div>

          </div>

          {/* Toggle */}
          <div className="flex items-center gap-4">

            <div className="text-right">

              <p className="text-sm font-semibold text-white">
                Ramadan Mode
              </p>

              <p
                className={`mt-1 text-xs font-medium ${
                  enabled
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {loading
                  ? "Loading..."
                  : enabled
                    ? "Enabled"
                    : "Disabled"}
              </p>

            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Enable Ramadan Mode"
              onClick={handleToggle}
              disabled={loading || saving}
              className={`
                relative
                flex
                h-8
                w-14
                shrink-0
                items-center
                rounded-full
                p-1
                transition-all
                duration-300
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${
                  enabled
                    ? "bg-emerald-500"
                    : "bg-slate-700"
                }
              `}
            >

              <span
                className={`
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-md
                  transition-transform
                  duration-300
                  ${
                    enabled
                      ? "translate-x-6"
                      : "translate-x-0"
                  }
                `}
              >
                {saving ? (
                  <Loader2
                    size={13}
                    className="animate-spin text-slate-600"
                  />
                ) : enabled ? (
                  <Check
                    size={13}
                    className="text-emerald-600"
                  />
                ) : null}
              </span>

            </button>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Disabled Description */}
        {!loading && !enabled && (
          <div className="mt-7 rounded-2xl border border-white/5 bg-white/[0.03] p-5">

            <div className="flex items-start gap-3">

              <Sparkles
                size={21}
                className="mt-1 shrink-0 text-amber-300"
              />

              <div>

                <h3 className="font-semibold text-white">
                  Get ready for Ramadan
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Activate RamadanOS to access your
                  fasting tracker, Quran Khatam planner,
                  daily routine, charity tracker and
                  dedicated Ramadan tools.
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  You can enable it before Ramadan
                  to prepare your goals and routine.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Enabled Modules */}
        {!loading && enabled && (
          <div className="mt-7">

            <div className="mb-5 flex items-center gap-2">

              <Check
                size={19}
                className="text-emerald-400"
              />

              <h3 className="font-semibold text-white">
                RamadanOS is activated
              </h3>

            </div>

            <p className="mb-5 text-sm text-slate-400">
              Your Ramadan workspace is ready.
              Choose the tools you want to explore as
              they are developed.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {ramadanModules.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      rounded-2xl
                      border
                      border-white/5
                      bg-white/[0.04]
                      p-4
                      transition-all
                      duration-300
                      hover:border-amber-400/30
                      hover:bg-white/[0.07]
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-amber-400/10
                        "
                      >
                        <Icon
                          size={21}
                          className="text-amber-300"
                        />
                      </div>

                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
                        Coming soon
                      </span>

                    </div>

                    <h4 className="mt-4 font-semibold text-white">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {item.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        )}

      </div>

    </section>
  );
}
