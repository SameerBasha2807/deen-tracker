import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

const activity = [
  {
    title: "Completed Fajr Prayer",
    time: "Today • 5:12 AM",
  },
  {
    title: "Read 3 Quran Pages",
    time: "Today • 6:00 AM",
  },
  {
    title: "Finished Daily Dhikr",
    time: "Yesterday • 8:30 PM",
  },
  {
    title: "Completed Weekly Goal",
    time: "2 Days Ago",
  },
];

export default function RecentActivity() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Recent Activity"
        subtitle="Your latest worship actions."
      />

      <div className="mt-8 space-y-4">
        {activity.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-2xl border border-[#172235] bg-[#081522] p-5 transition hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-md"
          >
            <div>
              <h3 className="font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {item.time}
              </p>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
              Completed
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}