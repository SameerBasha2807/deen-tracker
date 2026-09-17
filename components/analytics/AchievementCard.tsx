import { Award, Flame, Star } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const achievements = [
  {
    icon: Flame,
    title: "30 Day Prayer Streak",
  },
  {
    icon: Award,
    title: "100 Pages Read",
  },
  {
    icon: Star,
    title: "First Weekly Goal Completed",
  },
];

export default function AchievementCard() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Achievements"
        subtitle="Milestones you've unlocked."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {achievements.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-[#172235] bg-[#081522] p-6 text-center transition hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-lg"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Icon
                  size={30}
                  className="text-emerald-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {item.title}
              </h3>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}