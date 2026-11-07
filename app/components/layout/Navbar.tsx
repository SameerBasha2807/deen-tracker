"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/app/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/services/auth";

import {
  getRamadanMode,
  saveRamadanMode,
} from "@/lib/ramadan";

import {
  Menu,
  X,
  MoonStar,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Analytics", href: "/analytics" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [ramadanEnabled, setRamadanEnabled] = useState(false);
  const [ramadanLoading, setRamadanLoading] = useState(true);
  const [ramadanSaving, setRamadanSaving] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const loadRamadanPreference = useCallback(async () => {
    if (!user) {
      setRamadanEnabled(false);
      setRamadanLoading(false);
      return;
    }

    try {
      setRamadanLoading(true);

      const enabled = await getRamadanMode(user.uid);

      setRamadanEnabled(enabled);
    } catch (error) {
      console.error("Ramadan preference error:", error);
      setError("Could not load Ramadan preference.");
    } finally {
      setRamadanLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    void loadRamadanPreference();
  }, [authLoading, loadRamadanPreference]);

  // RAMADAN MODE TOGGLE
  async function handleRamadanToggle() {
    if (!user || ramadanSaving || ramadanLoading) {
      return;
    }

    const newValue = !ramadanEnabled;

    try {
      setRamadanSaving(true);
      setError("");

      await saveRamadanMode(user.uid, newValue);

      setRamadanEnabled(newValue);
      setMobileOpen(false);

      window.dispatchEvent(
        new CustomEvent("ramadan-mode-updated", {
          detail: {
            enabled: newValue,
          },
        })
      );

      if (newValue) {
        router.push("/dashboard/ramadan");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Ramadan toggle error:", error);
      setError("Could not update Ramadan Mode.");
    } finally {
      setRamadanSaving(false);
    }
  }

  // LOGOUT
  async function handleLogout() {
    try {
      setLoggingOut(true);
      setError("");

      await logoutUser();

      setMobileOpen(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  const initials =
    user?.displayName
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#07121D]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4 px-5 lg:px-8">
        {/* LOGO */}
        <Logo />

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center gap-5 xl:flex">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-slate-300 transition hover:text-emerald-400"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* DESKTOP RIGHT SIDE */}
        <div className="hidden items-center gap-3 lg:flex">
          {!authLoading && user && (
            <>
              {/* RAMADAN MODE */}
              <button
                type="button"
                onClick={handleRamadanToggle}
                disabled={ramadanLoading || ramadanSaving}
                aria-label="Toggle Ramadan Mode"
                aria-pressed={ramadanEnabled}
                title={
                  ramadanEnabled
                    ? "Disable Ramadan Mode"
                    : "Enable Ramadan Mode"
                }
                className="flex items-center gap-3 whitespace-nowrap rounded-full border border-amber-400/40 bg-emerald-950/40 px-3 py-2 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MoonStar
                  size={19}
                  className="text-amber-300"
                />

                <span className="text-sm font-medium text-white">
                  Ramadan Mode
                </span>

                <span
                  className={`relative flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                    ramadanEnabled
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      ramadanEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </span>
              </button>

              {/* USER AVATAR */}
              <div
                title={user.displayName || user.email || "Account"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-sm font-bold text-emerald-300"
              >
                {initials}
              </div>

              {/* MY DASHBOARD */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:scale-105"
              >
                <LayoutDashboard size={17} />
                My Dashboard
              </Link>

              <div className="h-8 w-px bg-slate-700" />

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-300 transition hover:text-red-400 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}
                Log Out
              </button>
            </>
          )}

          {/* GUEST */}
          {!authLoading && !user && (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white lg:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#07121D] px-6 py-5 lg:hidden">
          <nav className="flex flex-col gap-5">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400"
              >
                {item.name}
              </Link>
            ))}

            {!authLoading && user && (
              <>
                {/* MOBILE RAMADAN MODE */}
                <div className="border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={handleRamadanToggle}
                    disabled={ramadanLoading || ramadanSaving}
                    className="flex w-full items-center justify-between rounded-xl border border-amber-400/20 bg-emerald-950/30 p-4 disabled:opacity-60"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MoonStar className="text-amber-300" />
                      Ramadan Mode
                    </span>

                    <span
                      className={`relative flex h-6 w-11 items-center rounded-full p-1 ${
                        ramadanEnabled
                          ? "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-white transition-transform ${
                          ramadanEnabled
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white"
                >
                  My Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-5 py-3 font-medium text-red-400"
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </>
            )}

            {!authLoading && !user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-slate-300"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}