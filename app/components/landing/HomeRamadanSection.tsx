
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  MoonStar,
  CalendarDays,
  BookOpen,
  Clock,
  Heart,
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import { getRamadanMode } from "@/lib/ramadan";

/* =====================================================
   RAMADAN MODULES
===================================================== */

const ramadanModules = [
  {
    title: "Fasting Tracker",
    description: "Track your daily fasts throughout Ramadan.",
    icon: CalendarDays,
    color: "text-amber-300",
    href: "/dashboard/ramadan/fasting",
    available: true,
  },
  {
    title: "Quran Khatam",
    description: "Plan your reading targets and complete your Khatam.",
    icon: BookOpen,
    color: "text-emerald-300",
    href: "/dashboard/ramadan/quran-khatam",
    available: true,
  },
  {
    title: "Daily Planner",
    description: "Organize Suhoor, prayers, work and Iftar.",
    icon: Clock,
    color: "text-sky-300",
    href: "/dashboard/ramadan/planner",
  available: true,
  },
  {
    title: "Charity Tracker",
    description: "Track Sadaqah, donations and charitable goals.",
    icon: Heart,
    color: "text-pink-300",
    href: "/dashboard/ramadan/charity",
    available: true,
  },
  {
    title: "Last 10 Nights",
    description: "Plan your worship during the final ten nights.",
    icon: MoonStar,
    color: "text-violet-300",
    href: "/dashboard/ramadan/last-ten-nights",
    available: true,
  },
  {
    title: "Ramadan Analytics",
    description: "Review your Ramadan progress and achievements.",
    icon: BarChart3,
    color: "text-cyan-300",
    href: "/dashboard/ramadan/analytics",
    available: true,
  },
];

/* =====================================================
   HOME RAMADAN SECTION
===================================================== */

export default function HomeRamadanSection() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD RAMADAN PREFERENCE
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setEnabled(false);
      setLoading(false);
      return;
    }

    let active = true;
    let preferenceChanged = false;

    async function loadPreference() {
      try {
        setLoading(true);
        setError("");

        const result = await getRamadanMode(user!.uid);

        if (active && !preferenceChanged) {
          setEnabled(result);
        }
      } catch (error) {
        console.error(
          "Failed to load RamadanOS preference:",
          error
        );

        if (active) {
          setError(
            "Unable to load RamadanOS. Please refresh the page."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    /* =====================================================
       LISTEN FOR NAVBAR TOGGLE CHANGES
    ===================================================== */

    function handleRamadanModeChange(event: Event) {
      const customEvent = event as CustomEvent<{
        enabled: boolean;
      }>;

      if (
        typeof customEvent.detail?.enabled === "boolean"
      ) {
        preferenceChanged = true;

        setEnabled(customEvent.detail.enabled);
        setError("");
      }
    }

    window.addEventListener(
      "ramadan-mode-updated",
      handleRamadanModeChange
    );

    void loadPreference();

    return () => {
      active = false;

      window.removeEventListener(
        "ramadan-mode-updated",
        handleRamadanModeChange
      );
    };
  }, [user, authLoading]);

  /* =====================================================
     VISIBILITY
  ===================================================== */

  // Show RamadanOS only to authenticated users
  // who have enabled Ramadan Mode.

  if (
    authLoading ||
    loading ||
    !user ||
    !enabled
  ) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section
      id="ramadan-os"
      className="bg-[#030712] px-5 py-12 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">

        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-amber-400/20
            bg-gradient-to-br
            from-[#151C28]
            via-[#141D27]
            to-[#10201E]
            p-6
            shadow-2xl
            shadow-black/20
            sm:p-8
            lg:p-10
          "
        >

          {/* Background Glow */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-amber-400/10
              blur-[110px]
            "
          />

          <div className="relative">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-5">

                <div
                  className="
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-amber-400/20
                    bg-amber-400/10
                  "
                >
                  <MoonStar
                    size={37}
                    className="text-amber-300"
                  />
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                      RamadanOS
                    </h2>

                    <span
                      className="
                        rounded-full
                        border
                        border-amber-400/20
                        bg-amber-400/10
                        px-4
                        py-1.5
                        text-xs
                        font-semibold
                        text-amber-300
                      "
                    >
                      Your Ramadan Companion
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-slate-400 sm:text-base">
                    Prepare, plan and make your Ramadan meaningful.
                  </p>

                </div>

              </div>

              {/* ACTIVATION STATUS */}

              <div className="flex items-center gap-4 md:justify-end">

                <div className="text-right">

                  <p className="text-sm font-semibold text-white">
                    Ramadan Mode
                  </p>

                  <p className="mt-1 text-xs font-medium text-emerald-400">
                    Enabled
                  </p>

                </div>

                <div
                  className="
                    flex
                    h-10
                    w-16
                    items-center
                    justify-end
                    rounded-full
                    bg-emerald-500
                    p-1
                  "
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
                    <Check
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* =================================================
               INTRODUCTION
            ================================================= */}

            <div className="mt-10">

              <div className="flex items-center gap-3">

                <Check
                  size={21}
                  className="text-emerald-400"
                />

                <h3 className="text-lg font-bold text-white">
                  RamadanOS is activated
                </h3>

              </div>

              <p className="mt-5 flex items-center gap-2 text-sm leading-7 text-slate-400 sm:text-base">

                <Sparkles
                  size={17}
                  className="shrink-0 text-amber-300"
                />

                Your Ramadan workspace is ready.
                Choose the tools you want to explore.

              </p>

            </div>

            {/* =================================================
               RAMADAN MODULES
            ================================================= */}

            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {ramadanModules.map((item) => {
                const Icon = item.icon;

                const card = (
                  <div
                    className={`
                      group
                      h-full
                      rounded-3xl
                      border
                      border-white/[0.07]
                      bg-white/[0.045]
                      p-5
                      transition-all
                      duration-300
                      ${
                        item.available
                          ? "cursor-pointer hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.07]"
                          : "opacity-80"
                      }
                    `}
                  >

                    {/* Module Icon */}

                    <div className="flex items-center justify-between">

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-amber-400/10
                        "
                      >
                        <Icon
                          size={24}
                          className={item.color}
                        />
                      </div>

                      {/* Availability */}

                      {item.available ? (
                        <span
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-emerald-400/20
                            bg-emerald-400/10
                            px-3
                            py-1.5
                            text-[11px]
                            font-semibold
                            text-emerald-300
                          "
                        >
                          <Check size={12} />
                          Available
                        </span>
                      ) : (
                        <span
                          className="
                            rounded-full
                            bg-slate-800
                            px-3
                            py-1.5
                            text-[11px]
                            font-medium
                            text-slate-400
                          "
                        >
                          Coming soon
                        </span>
                      )}

                    </div>

                    {/* Module Details */}

                    <h4 className="mt-6 text-lg font-bold text-white transition group-hover:text-amber-300">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>

                    {/* Open Tracker */}

                    {item.available && (
                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-400">

                        Open Tracker

                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />

                      </div>
                    )}

                  </div>
                );

                /* Fasting Tracker is functional */

                if (item.available) {
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block h-full"
                    >
                      {card}
                    </Link>
                  );
                }

                /* Other modules are previews */

                return (
                  <div key={item.title}>
                    {card}
                  </div>
                );
              })}

            </div>

            {/* ERROR */}

            {error && (
              <p
                role="alert"
                className="mt-5 text-sm text-red-400"
              >
                {error}
              </p>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
