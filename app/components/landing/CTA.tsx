import Link from "next/link";
import { ArrowRight } from "lucide-react";

import HeroBackground from "./HeroBackground";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div
          className="
            overflow-hidden
            rounded-[40px]
            border
            border-slate-800
            bg-slate-900/70
            px-10
            py-20
            text-center
            backdrop-blur-2xl
            shadow-[0_30px_80px_rgba(0,0,0,.45)]
          "
        >
          {/* Glow */}

          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[180px]" />

          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              Join DeenTracker
            </span>

            <h2 className="mt-8 text-5xl font-bold text-white lg:text-6xl">
              Begin Your Journey Today
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Build better Islamic habits, stay consistent with your worship,
              and strengthen your connection with Allah through beautiful daily
              tracking and insightful analytics.
            </p>

            <Link
              href="/dashboard"
              className="
                mt-12
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-emerald-600
                to-emerald-500
                px-8
                py-4
                font-semibold
                text-white
                shadow-lg
                shadow-emerald-500/20
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-105
                hover:shadow-emerald-500/40
              "
            >
              Get Started Free

              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}