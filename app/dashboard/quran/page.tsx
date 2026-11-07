
import Link from "next/link";

import {
  BookOpenCheck,
  ArrowRight,
} from "lucide-react";

import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";

import QuranHero from "@/app/components/quran/QuranHero";
import QuranProgress from "@/app/components/quran/QuranProgress";
import ReadingStreak from "@/app/components/quran/ReadingStreak";
import ReadingHeatmap from "@/app/components/quran/ReadingHeatmap";
import LogQuranReading from "@/app/components/quran/LogQuranReading";
import QuranTemplates from "@/app/components/quran/QuranTemplates";

export default function QuranPage() {
  return (
    <main className="flex min-h-screen bg-[#030712]">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <TopBar />

        <div className="space-y-8 p-4 sm:p-8">

          <QuranHero />

          {/* QURAN KHATAM NAVIGATION */}

          <Link
            href="/dashboard/ramadan/quran-khatam"
            className="group block"
          >
            <section className="flex flex-col gap-4 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-[#17251F] to-[#111D27] p-6 transition-all duration-300 hover:border-amber-400/50 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                  <BookOpenCheck size={28} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    Quran Khatam Tracker
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Manage Khatam goals, track all 30 Juz and record daily reading.
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                  Open Tracker
                </span>

                <ArrowRight
                  size={19}
                  className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-amber-300"
                />

              </div>

            </section>
          </Link>

          {/* EXISTING DAILY QURAN FEATURES */}

          <LogQuranReading />

          <QuranTemplates />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <QuranProgress />

            <ReadingStreak />

          </div>

          <ReadingHeatmap />

        </div>

      </div>

    </main>
  );
}
