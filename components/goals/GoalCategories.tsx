"use client";

import {
  BookOpen,
  GraduationCap,
  HandCoins,
  Heart,
  MoonStar,
  Sunrise,
} from "lucide-react";

import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

import { useAuth } from "@/contexts/AuthContext";
import { getUserGoals } from "@/lib/goals";

import type { GoalCategory } from "@/lib/types";

interface CategoryConfig {
  value: GoalCategory;
  title: string;
  description: string;
  icon: typeof MoonStar;
  color: string;
  iconColor: string;
}

const categories: CategoryConfig[] = [
  {
    value: "prayer",
    title: "Prayer",
    description:
      "Build consistency with your daily Salah.",
    icon: Sunrise,
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    value: "quran",
    title: "Quran",
    description:
      "Set goals for Quran reading, Juz and memorization.",
    icon: BookOpen,
    color: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    value: "dhikr",
    title: "Dhikr & Dua",
    description:
      "Stay consistent with your daily remembrance and duas.",
    icon: Heart,
    color: "bg-pink-500/10",
    iconColor: "text-pink-400",
  },
  {
    value: "fasting",
    title: "Fasting",
    description:
      "Track your voluntary and missed fasting goals.",
    icon: MoonStar,
    color: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    value: "charity",
    title: "Charity",
    description:
      "Set goals for Sadaqah, donations and helping others.",
    icon: HandCoins,
    color: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
  },
  {
    value: "learning",
    title: "Islamic Learning",
    description:
      "Track Hadith, Seerah, Tafsir and Islamic knowledge.",
    icon: GraduationCap,
    color: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
];

type CategoryCounts = Record<GoalCategory, number>;

function createEmptyCounts(): CategoryCounts {
  return {
    prayer: 0,
    quran: 0,
    dhikr: 0,
    fasting: 0,
    charity: 0,
    learning: 0,
  };
}

export default function GoalCategories() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [categoryCounts, setCategoryCounts] =
    useState<CategoryCounts>(
      createEmptyCounts()
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCategoryCounts(
        createEmptyCounts()
      );

      setLoading(false);
      return;
    }

    /*
     * Store the UID in a local constant.
     * This keeps TypeScript's null narrowing
     * valid inside the async function below.
     */
    const uid = user.uid;

    let active = true;

    async function loadCategoryCounts() {
      try {
        setLoading(true);

        const goals = await getUserGoals(uid);

        const counts =
          createEmptyCounts();

        for (const goal of goals) {
          /*
           * Only count active goals.
           */
          if (!goal.active) {
            continue;
          }

          /*
           * Only count supported categories.
           */
          if (
            goal.category in counts
          ) {
            counts[goal.category]++;
          }
        }

        if (active) {
          setCategoryCounts(counts);
        }
      } catch (error) {
        console.error(
          "Could not load goal categories:",
          error
        );

        if (active) {
          setCategoryCounts(
            createEmptyCounts()
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCategoryCounts();

    function handleGoalUpdate() {
      void loadCategoryCounts();
    }

    window.addEventListener(
      "goal-data-updated",
      handleGoalUpdate
    );

    return () => {
      active = false;

      window.removeEventListener(
        "goal-data-updated",
        handleGoalUpdate
      );
    };
  }, [user, authLoading]);

  return (
    <DashboardCard>
      <SectionHeader
        title="Goal Categories"
        subtitle="Focus your goals on the areas of Deen that matter to you."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;

          const count =
            categoryCounts[
              category.value
            ];

          return (
            <div
              key={category.value}
              className="group rounded-2xl border border-[#172235] bg-[#081522] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.color}`}
              >
                <Icon
                  className={
                    category.iconColor
                  }
                  size={26}
                />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                {category.title}
              </h3>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                {category.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Active Goals
                </span>

                <span className="text-lg font-semibold text-emerald-400">
                  {loading ? "..." : count}
                </span>
              </div>

              {!loading && (
                <p className="mt-2 text-sm text-slate-500">
                  {count === 0
                    ? "No active goals yet"
                    : count === 1
                    ? "1 goal in progress"
                    : `${count} goals in progress`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}