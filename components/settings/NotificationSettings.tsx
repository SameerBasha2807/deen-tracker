"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Flame,
  MoonStar,
  Target,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const initialNotifications = [
  {
    id: "prayer",
    title: "Prayer Reminders",
    description: "Get reminded when it is time for Salah.",
    icon: MoonStar,
    enabled: true,
  },
  {
    id: "quran",
    title: "Quran Reminder",
    description: "Receive a reminder to complete your daily reading.",
    icon: BookOpen,
    enabled: true,
  },
  {
    id: "goals",
    title: "Goal Reminders",
    description: "Stay on track with your daily spiritual goals.",
    icon: Target,
    enabled: true,
  },
  {
    id: "streak",
    title: "Streak Reminders",
    description: "Get reminded before your streak is at risk.",
    icon: Flame,
    enabled: false,
  },
  {
    id: "summary",
    title: "Daily Summary",
    description: "Receive a summary of your daily progress.",
    icon: Bell,
    enabled: false,
  },
];

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const toggleNotification = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              enabled: !notification.enabled,
            }
          : notification
      )
    );
  };

  return (
    <DashboardCard>
      <SectionHeader
        title="Notifications"
        subtitle="Choose which reminders you want to receive."
      />

      <div className="space-y-4">
        {notifications.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#0A1928]"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Icon
                  size={24}
                  className="text-emerald-400"
                />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {item.description}
                </p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggleNotification(item.id)}
                aria-label={`Toggle ${item.title}`}
                aria-pressed={item.enabled}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  item.enabled
                    ? "bg-emerald-500"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    item.enabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}