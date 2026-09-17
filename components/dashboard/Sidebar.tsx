"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MoonStar,
  BookOpen,
  BarChart3,
  HandCoins,
  Target,
  Settings,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Prayer",
    href: "/dashboard/prayer",
    icon: MoonStar,
  },
  {
    title: "Quran",
    href: "/dashboard/quran",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Charity",
    href: "/dashboard/charity",
    icon: HandCoins,
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },

];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 bg-[#020914] lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-slate-800 p-8">
        <Link
          href="/"
          className="inline-block"
          aria-label="Go to DeenTracker home"
        >
          <h1 className="text-3xl font-bold text-emerald-400 transition hover:text-emerald-300">
            DeenTracker
          </h1>
        </Link>

        <p className="mt-2 text-sm text-slate-400">
          Build Consistency
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2 p-6">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 ${
                active
                  ? "bg-emerald-500/15 font-semibold text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                  : "text-slate-400 hover:bg-[#06101c] hover:text-emerald-400"
              }`}
            >
              <Icon size={22} />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}