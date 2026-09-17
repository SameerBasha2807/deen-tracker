import Link from "next/link";
import {
  BookOpen,
  MoonStar,
  Target,
  BarChart3,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const actions = [
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
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export default function QuickActions() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Quick Actions"
        subtitle="Jump directly to your most used modules."
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-2xl border border-[#172235] bg-[#0A1624] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0D1B2C] hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Icon
                  size={26}
                  className="text-emerald-400"
                />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                {action.title}
              </h3>

              <p className="mt-2 text-slate-400">
                Open module
              </p>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}