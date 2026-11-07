
"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export default function HeroButtons() {
  const { user, loading } = useAuth();

  const primaryText = loading
    ? "Loading..."
    : user
      ? "My Dashboard"
      : "Get Started";

  const primaryLink = user
    ? "/dashboard"
    : "/register";

  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row">

      {/* PRIMARY BUTTON */}
      <Link
        href={loading ? "/" : primaryLink}
        aria-disabled={loading}
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
        {primaryText}

        {!loading && user && (
          <ArrowRight className="ml-2 inline h-4 w-4" />
        )}
      </Link>

      {/* SECONDARY BUTTON */}
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

        <ArrowRight className="h-4 w-4" />
      </Link>

    </div>
  );
}
