"use client";

import Link from "next/link";

import { Home } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

function getFirstName(
  displayName?: string | null,
  email?: string | null
) {
  if (displayName?.trim()) {
    return displayName.trim().split(" ")[0];
  }

  if (email?.trim()) {
    return email.split("@")[0];
  }

  return "User";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

export default function TopBar() {
  const { user } = useAuth();

  const firstName = getFirstName(
    user?.displayName,
    user?.email
  );

  const greeting = getGreeting();

  return (
    <header className="flex h-20 items-center justify-between bg-[#020914] px-8">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-bold text-white">
          {greeting}, {firstName} 👋
        </h2>

        <p className="mt-1 text-slate-400">
          Welcome back. Continue your journey.
        </p>
      </div>

      {/* Home */}
      <Link
        href="/"
        aria-label="Home"
        title="Home"
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-800
          bg-[#06101c]
          transition
          hover:border-emerald-500
          hover:bg-[#0a1724]
        "
      >
        <Home
          size={22}
          className="text-slate-300"
        />
      </Link>
    </header>
  );
}