"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import {
  getRamadanMode,
  saveRamadanMode,
} from "@/lib/ramadan";

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
  Loader2,
} from "lucide-react";

const ramadanModules = [
  {
    title: "Fasting Tracker",
    description: "Track your daily fasts throughout Ramadan.",
    icon: CalendarDays,
    color: "text-amber-300",
    href: "/dashboard/ramadan/fasting",
  },
  {
    title: "Quran Khatam",
    description: "Plan your reading targets and complete your Khatam.",
    icon: BookOpen,
    color: "text-emerald-300",
    href: "/dashboard/ramadan/quran-khatam",
  },
  {
    title: "Daily Planner",
    description: "Organize Suhoor, prayers, work and Iftar.",
    icon: Clock,
    color: "text-sky-300",
    href: "/dashboard/ramadan/planner",
  },
  {
    title: "Charity Tracker",
    description: "Track Sadaqah, donations and charitable goals.",
    icon: Heart,
    color: "text-pink-300",
    href: "/dashboard/ramadan/charity",
  },
  {
    title: "Last 10 Nights",
    description: "Plan your worship during the final ten nights.",
    icon: MoonStar,
    color: "text-violet-300",
    href: "/dashboard/ramadan/last-ten-nights",
  },
  {
    title: "Ramadan Analytics",
    description: "Review your Ramadan progress and achievements.",
    icon: BarChart3,
    color: "text-cyan-300",
    href: "/dashboard/ramadan/analytics",
  },
];

export default function RamadanOSPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD SAVED RAMADAN MODE
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    let active = true;

    async function loadPreference() {
      try {
        setLoading(true);

        const result = await getRamadanMode(user!.uid);

        if (!active) return;

        if (!result) {
          router.replace("/");
          return;
        }

        setEnabled(true);
      } catch (error) {
        console.error("Failed to load Ramadan Mode:", error);

        if (active) {
          setError("Unable to load RamadanOS. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPreference();

    return () => {
      active = false;
    };
  }, [user, authLoading, router]);

  // TURN RAMADAN MODE OFF
  async function handleRamadanToggle() {
    if (!user || saving || !enabled) return;

    try {
      setSaving(true);
      setError("");

      await saveRamadanMode(user.uid, false);

      setEnabled(false);

      window.dispatchEvent(
        new CustomEvent("ramadan-mode-updated", {
          detail: {
            enabled: false,
          },
        })
      );

      router.replace("/");
    } catch (error) {
      console.error("Failed to disable Ramadan Mode:", error);
      setError("Could not disable Ramadan Mode. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // LOADING STATE
  if (authLoading || loading || !enabled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030712] px-5 text-center">
        <div>
          <Loader2 className="mx-auto animate-spin text-amber-300" size={34} />

          <p className="mt-4 text-sm text-slate-400">
            {error || "Loading RamadanOS..."}
          </p>

          {error && (
            <button
              type="button"
              onClick={() => router.replace("/")}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Return Home
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] px-5 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/[0.07] blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* RAMADANOS HEADER */}
        <header className="flex flex-col gap-6 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
              <MoonStar size={31} className="text-amber-300" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                RamadanOS
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Your Ramadan Companion
              </p>
            </div>
          </div>

          {/* RAMADAN MODE SWITCH */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-400/20 bg-white/[0.035] px-4 py-3 sm:justify-start">
            <div>
              <p className="text-sm font-semibold text-white">
                Ramadan Mode
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-400">
                Enabled
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Turn Ramadan Mode off"
              onClick={handleRamadanToggle}
              disabled={saving}
              className="relative flex h-7 w-12 items-center rounded-full bg-emerald-500 p-1 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin text-white"
                />
              ) : (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                  <Check size={13} className="text-emerald-600" />
                </span>
              )}
            </button>
          </div>
        </header>

        {/* INTRODUCTION */}
        <section className="py-10 sm:py-12">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles size={19} />

            <span className="text-sm font-semibold">
              Your Ramadan workspace
            </span>
          </div>

          <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            Make this Ramadan more intentional.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Prepare, plan and track your worship throughout Ramadan.
            Choose a tool below to continue.
          </p>
        </section>

        {/* RAMADAN MODULES */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                Ramadan Workspace
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your tools in one place
              </p>
            </div>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              6 Modules
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ramadanModules.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group block rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.065] hover:shadow-xl hover:shadow-black/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-400/10 p-3">
                      <Icon size={25} className={item.color} />
                    </div>

                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                      <Check size={12} />
                      Available
                    </span>
                  </div>

                  <h4 className="mt-7 text-lg font-bold text-white transition group-hover:text-amber-300">
                    {item.title}
                  </h4>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    Open Tracker

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-6 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* FOOTER */}
        <footer className="mt-14 border-t border-white/[0.07] py-6 text-center">
          <p className="text-xs text-slate-500">
            RamadanOS · Your personal Ramadan workspace
          </p>
        </footer>
      </div>
    </main>
  );
}



