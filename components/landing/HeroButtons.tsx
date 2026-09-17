import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroButtons() {
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
      {/* Primary Button */}
      <Link
        href="/dashboard"
        className="
          rounded-2xl
          bg-gradient-to-r
          from-emerald-600
          to-emerald-500
          px-8
          py-4
          text-center
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
        Get Started
      </Link>

      {/* Secondary Button */}
      <Link
        href="/features"
        className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          border
          border-slate-700
          bg-slate-900/80
          px-8
          py-4
          font-semibold
          text-slate-200
          backdrop-blur-xl
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-emerald-500/40
          hover:bg-slate-800
          hover:text-white
        "
      >
        Explore Features

        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}