"use client";

import Link from "next/link";
import { Mail, MoonStar } from "lucide-react";

import HeroBackground from "./HeroBackground";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#030712]">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">

          {/* Brand */}

          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 shadow-lg shadow-emerald-500/20">
                <MoonStar className="h-6 w-6 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-white">
                DeenTracker
              </h2>
            </div>

            <p className="mt-6 leading-7 text-slate-400">
              Build consistency in your daily worship through prayer,
              Quran reading, goals and insightful analytics.
            </p>
          </div>

          {/* Product */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Product
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/features"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                Features
              </Link>

              <Link
                href="/dashboard"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                Dashboard
              </Link>

              <Link
                href="/about"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                About
              </Link>
            </div>
          </div>

          {/* Resources */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Resources
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/privacy"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                Terms of Service
              </Link>

              <Link
                href="/contact"
                className="text-slate-400 transition duration-300 hover:text-emerald-400"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="mt-6 flex items-center gap-3 text-slate-400">
              <Mail className="h-5 w-5 text-emerald-400" />
              <span>support.deentracker@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center text-slate-500">
          © 2026 DeenTracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}