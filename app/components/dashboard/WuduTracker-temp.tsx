
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Droplets,
  Check,
  Clock,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getWuduStatus,
  saveWuduStatus,
  type WuduValue,
  type WuduStatusRecord,
} from "@/lib/wudu";

/* =====================================================
   TIME FORMATTER
===================================================== */

function formatTime(
  timestamp: number | null
): string {
  if (!timestamp) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(timestamp));
}

/* =====================================================
   WUDU TRACKER
===================================================== */

export default function WuduTracker() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [savedStatus, setSavedStatus] =
    useState<WuduStatusRecord | null>(null);

  const [sessionStatus, setSessionStatus] =
    useState<WuduValue | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD WUDU STATUS
  ===================================================== */

  const loadWudu = useCallback(async () => {
    if (!user) {
      setSavedStatus(null);
      setSessionStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getWuduStatus(
        user.uid
      );

      setSavedStatus(result);

      // Ask user to confirm current status
      setSessionStatus(null);

    } catch (error) {
      console.error(
        "Failed to load Wudu status:",
        error
      );

      setError(
        "Unable to load your Wudu status."
      );

    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadWudu();

  }, [
    authLoading,
    loadWudu,
  ]);

  /* =====================================================
     UPDATE WUDU STATUS
  ===================================================== */

  async function handleStatusChange(
    status: WuduValue
  ) {
    if (!user || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await saveWuduStatus(
        user.uid,
        status
      );

      setSavedStatus(result);
      setSessionStatus(status);

    } catch (error) {
      console.error(
        "Failed to update Wudu status:",
        error
      );

      setError(
        "Unable to update your Wudu status. Please try again."
      );

    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     AUTHENTICATION CHECK
  ===================================================== */

  if (authLoading || !user) {
    return null;
  }

  /* =====================================================
     STATUS
  ===================================================== */

  const isInWudu =
    sessionStatus === "in_wudu";

  const isNotInWudu =
    sessionStatus === "not_in_wudu";

  const needsConfirmation =
    savedStatus !== null &&
    sessionStatus === null;

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
        border-[#173A37]
        bg-[#071A20]
        p-6
        shadow-lg
        shadow-black/10
      "
    >

      {/* Background Glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-48
          w-48
          rounded-full
          bg-emerald-500/10
          blur-3xl
        "
      />

      <div className="relative">

        {/* Header */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

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
                bg-sky-500/10
              "
            >
              <Droplets
                size={30}
                className="text-sky-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Are you in Wudu?
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Keep track of your current Wudu status.
              </p>
            </div>

          </div>

          {/* Toggle Buttons */}
          <div
            className="
              grid
              w-full
              grid-cols-2
              gap-2
              rounded-2xl
              border
              border-slate-700/70
              bg-[#020914]
              p-1.5
              xl:w-[420px]
            "
          >

            {/* Not in Wudu */}
            <button
              type="button"
              onClick={() =>
                handleStatusChange("not_in_wudu")
              }
              disabled={loading || saving}
              aria-pressed={isNotInWudu}
              className={`
                flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition-all
                duration-200
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${
                  isNotInWudu
                    ? "bg-slate-700 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {isNotInWudu && (
                <Check size={18} />
              )}

              Not in Wudu
            </button>

            {/* In Wudu */}
            <button
              type="button"
              onClick={() =>
                handleStatusChange("in_wudu")
              }
              disabled={loading || saving}
              aria-pressed={isInWudu}
              className={`
                flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                px-3
                py-3
                text-sm
                font-semibold
                transition-all
                duration-200
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${
                  isInWudu
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                }
              `}
            >
              {isInWudu && (
                <Check size={18} />
              )}

              In Wudu
            </button>

          </div>

        </div>

        {/* Status Information */}
        <div className="mt-5 border-t border-white/5 pt-4">

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Loading your Wudu status...
            </div>

          ) : saving ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Saving your status...
            </div>

          ) : sessionStatus !== null ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-400">

              <ShieldCheck size={17} />

              {isInWudu
                ? "You are marked as In Wudu."
                : "You are marked as Not in Wudu."}

              <span className="text-slate-500">
                Status confirmed.
              </span>

            </div>

          ) : needsConfirmation ? (
            <div className="text-sm text-amber-400">

              Your last recorded status was{" "}
              <strong>
                {savedStatus.status === "in_wudu"
                  ? "In Wudu"
                  : "Not in Wudu"}
              </strong>
              . Please confirm your current status.

            </div>

          ) : (
            <p className="text-sm text-slate-400">
              Select your current Wudu status.
              Your selection will be saved privately.
            </p>
          )}

          {/* Last Wudu Time */}
          {savedStatus?.lastWuduAt && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">

              <Clock size={14} />

              Last Wudu recorded:{" "}
              {formatTime(
                savedStatus.lastWuduAt
              )}

            </div>
          )}

          {/* Last Confirmation */}
          {savedStatus?.lastConfirmedAt && (
            <div className="mt-2 text-xs text-slate-500">

              Last confirmed:{" "}
              {formatTime(
                savedStatus.lastConfirmedAt
              )}

            </div>
          )}

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="mt-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

        </div>

      </div>

    </section>
  );
}
