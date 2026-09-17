import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  MoonStar,
  Sparkles,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <Navbar />

      <section className="relative overflow-hidden bg-[#030712] py-24">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Background Glow */}
        <div className="absolute left-1/2 top-0 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[180px]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[180px]" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[160px]" />

        <div className="relative mx-auto max-w-6xl px-6">
          {/* Back Button */}

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition-all duration-300 hover:border-emerald-500 hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* Hero */}

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
              <MoonStar size={16} />
              About DeenTracker
            </div>

            <h1 className="mt-8 text-5xl font-bold leading-tight lg:text-6xl">
              Building Consistency.
              <br />
              Strengthening Faith.
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              DeenTracker helps Muslims develop meaningful daily habits through
              beautiful design, insightful analytics and simple worship
              tracking—all inside one elegant experience.
            </p>
          </div>

          {/* Main Card */}

          <div className="mt-20 rounded-[36px] border border-slate-800 bg-slate-900/80 p-10 shadow-[0_30px_80px_rgba(0,0,0,.5)] backdrop-blur-2xl">

            <div className="grid gap-10 lg:grid-cols-2">

              {/* Mission */}

              <div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <Sparkles
                    size={32}
                    className="text-emerald-400"
                  />
                </div>

                <h2 className="text-3xl font-bold">
                  Our Mission
                </h2>

                <p className="mt-6 leading-8 text-slate-400">
                  We believe consistency is more valuable than perfection.
                  DeenTracker helps Muslims stay connected to their daily
                  worship by making habits visible, measurable and motivating.
                </p>

                <p className="mt-5 leading-8 text-slate-400">
                  Whether it's Salah, Quran, Dhikr, charity or personal goals,
                  everything lives inside one beautiful dashboard designed to
                  encourage daily spiritual growth.
                </p>
              </div>

              {/* Why */}

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-8">
                <h2 className="text-3xl font-bold">
                  Why We Built It
                </h2>

                <p className="mt-6 leading-8 text-slate-400">
                  Most habit trackers are generic. DeenTracker is designed
                  specifically for Islamic worship, helping users remain
                  consistent without unnecessary complexity.
                </p>

                <div className="mt-8 space-y-5">

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Prayer Tracking</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Quran Reading Progress</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Dhikr & Daily Habits</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Daily Analytics Dashboard</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Privacy Focused</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Cards */}

            <div className="mt-14 grid gap-8 md:grid-cols-2">

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-8 transition duration-300 hover:-translate-y-1 hover:border-emerald-500">

                <ShieldCheck
                  size={36}
                  className="text-emerald-400"
                />

                <h3 className="mt-6 text-2xl font-semibold">
                  Privacy First
                </h3>

                <p className="mt-4 leading-8 text-slate-400">
                  Your worship records belong only to you. Future versions will
                  include authentication, encrypted cloud sync and complete
                  privacy controls.
                </p>

              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-950 p-8 transition duration-300 hover:-translate-y-1 hover:border-emerald-500">

                <Heart
                  size={36}
                  className="text-rose-400"
                />

                <h3 className="mt-6 text-2xl font-semibold">
                  Built With Purpose
                </h3>

                <p className="mt-4 leading-8 text-slate-400">
                  Every screen is crafted to encourage reflection, consistency
                  and spiritual growth—not endless scrolling or distractions.
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}