"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { BookOpen } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  getDailyQuranLog,
  getQuranSettings,
  saveQuranDailyGoal,
  saveDailyQuranPages,
} from "@/lib/quran";

function todayLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export default function LogQuranReading() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [date, setDate] =
    useState(todayLocalDate());

  const [pages, setPages] =
    useState("");

  const [dailyGoal, setDailyGoal] =
    useState("");

  const [savedPages, setSavedPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [savingPages, setSavingPages] =
    useState(false);

  const [savingGoal, setSavingGoal] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =====================================================
     LOAD TODAY'S DATA
  ===================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setSavedPages(0);
      setPages("");
      setDailyGoal("");
      setLoading(false);
      return;
    }

    let active = true;

async function loadToday() {
  if (!user) {
    return;
  }

  try {
        setLoading(true);
        setMessage("");

        const [
          log,
          settings,
        ] = await Promise.all([
          getDailyQuranLog(
            user.uid,
            date
          ),
          getQuranSettings(
            user.uid
          ),
        ]);

        if (!active) {
          return;
        }

        setSavedPages(
          log.pagesRead
        );

        setDailyGoal(
          String(settings.dailyGoal)
        );

        /*
         * Only put a value in the input
         * when today's reading exists.
         */
        if (log.pagesRead > 0) {
          setPages(
            String(log.pagesRead)
          );
        } else {
          setPages("");
        }
      } catch (error) {
        console.error(
          "Could not load Quran tracker:",
          error
        );

        if (active) {
          setMessage(
            "Could not load today's Quran reading."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadToday();

    return () => {
      active = false;
    };
  }, [
    user,
    authLoading,
    date,
  ]);

  /* =====================================================
     AUTOMATIC MIDNIGHT DATE CHANGE
  ===================================================== */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        const currentDate =
          todayLocalDate();

        setDate((previousDate) => {
          if (
            previousDate !==
            currentDate
          ) {
            return currentDate;
          }

          return previousDate;
        });
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  /* =====================================================
     LISTEN FOR UPDATES FROM OTHER
     QURAN COMPONENTS
  ===================================================== */

  useEffect(() => {
    function handleQuranUpdate() {
      setDate(
        todayLocalDate()
      );
    }

    window.addEventListener(
      "quran-data-updated",
      handleQuranUpdate
    );

    return () => {
      window.removeEventListener(
        "quran-data-updated",
        handleQuranUpdate
      );
    };
  }, []);

  /* =====================================================
     SAVE PAGES
  ===================================================== */

  async function handlePagesSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Please sign in first."
      );
      return;
    }

    const pageCount =
      Number(pages);

    if (
      !Number.isInteger(
        pageCount
      ) ||
      pageCount < 0
    ) {
      setMessage(
        "Enter a valid number of pages."
      );
      return;
    }

    try {
      setSavingPages(true);
      setMessage("");

      await saveDailyQuranPages(
        user.uid,
        date,
        pageCount
      );

      setSavedPages(
        pageCount
      );

      /*
       * Tell QuranProgress and
       * other dashboard components
       * to reload their Firebase data.
       */
      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );

      setMessage(
        "Today's Quran reading has been saved."
      );
    } catch (error) {
      console.error(
        "Could not save Quran reading:",
        error
      );

      setMessage(
        "Could not save your reading. Please try again."
      );
    } finally {
      setSavingPages(false);
    }
  }

  /* =====================================================
     SAVE DAILY GOAL
  ===================================================== */

  async function handleGoalSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Please sign in first."
      );
      return;
    }

    const goal =
      Number(dailyGoal);

    if (
      !Number.isInteger(
        goal
      ) ||
      goal <= 0
    ) {
      setMessage(
        "Daily goal must be at least 1 page."
      );
      return;
    }

    try {
      setSavingGoal(true);
      setMessage("");

      await saveQuranDailyGoal(
        user.uid,
        goal
      );

      setDailyGoal(
        String(goal)
      );

      /*
       * Update QuranProgress
       * immediately.
       */
      window.dispatchEvent(
        new Event(
          "quran-data-updated"
        )
      );

      setMessage(
        "Your daily Quran goal has been saved."
      );
    } catch (error) {
      console.error(
        "Could not save Quran goal:",
        error
      );

      setMessage(
        "Could not save your goal. Please try again."
      );
    } finally {
      setSavingGoal(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    authLoading ||
    loading
  ) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-400">
        Loading today's Quran tracker...
      </section>
    );
  }

  /* =====================================================
     NOT SIGNED IN
  ===================================================== */

  if (!user) {
    return (
      <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 text-slate-300">
        Please sign in to track your Quran reading.
      </section>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 shadow-sm">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-emerald-500/10 p-3">
          <BookOpen
            className="text-emerald-400"
            size={24}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Quran Reading
          </h2>

          <p className="text-sm text-slate-400">
            Track the Quran you read from your physical copy.
          </p>
        </div>

      </div>

      {/* FORMS */}

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        {/* DAILY GOAL */}

        <form
          onSubmit={
            handleGoalSubmit
          }
          className="rounded-2xl border border-[#172235] bg-[#081522] p-5"
        >
          <label
            htmlFor="quran-goal"
            className="block text-sm font-medium text-slate-300"
          >
            Your daily Quran goal
          </label>

          <p className="mt-1 text-xs text-slate-500">
            Choose how many pages you want to read each day.
          </p>

          <div className="mt-4 flex gap-3">

            <input
              id="quran-goal"
              type="number"
              min="1"
              step="1"
              value={dailyGoal}
              onChange={(event) =>
                setDailyGoal(
                  event.target.value
                )
              }
              className="min-w-0 flex-1 rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={
                savingGoal
              }
            />

            <button
              type="submit"
              disabled={
                savingGoal
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingGoal
                ? "Saving..."
                : "Save Goal"}
            </button>

          </div>
        </form>

        {/* PAGES READ */}

        <form
          onSubmit={
            handlePagesSubmit
          }
          className="rounded-2xl border border-[#172235] bg-[#081522] p-5"
        >
          <label
            htmlFor="quran-pages"
            className="block text-sm font-medium text-slate-300"
          >
            Pages read today
          </label>

          <p className="mt-1 text-xs text-slate-500">
            Enter the pages you physically read today.
          </p>

          <div className="mt-4 flex gap-3">

            <input
              id="quran-pages"
              type="number"
              min="0"
              step="1"
              value={pages}
              onChange={(event) =>
                setPages(
                  event.target.value
                )
              }
              placeholder="e.g. 5"
              className="min-w-0 flex-1 rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-white outline-none focus:border-emerald-500"
              disabled={
                savingPages
              }
            />

            <button
              type="submit"
              disabled={
                savingPages
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPages
                ? "Saving..."
                : "Save Reading"}
            </button>

          </div>
        </form>

      </div>

      {/* STATUS */}

      <div className="mt-5 text-sm">

        {savedPages > 0 && (
          <p className="text-emerald-400">
            You have recorded{" "}
            <strong>
              {savedPages}
            </strong>{" "}
            page
            {savedPages === 1
              ? ""
              : "s"} today.
          </p>
        )}

        {message && (
          <p className="mt-2 text-slate-400">
            {message}
          </p>
        )}

      </div>

    </section>
  );
}