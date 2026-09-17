import SectionHeader from "@/components/ui/SectionHeader";

const history = [
  {
    day: "Yesterday",
    status: "Completed",
  },
  {
    day: "2 Days Ago",
    status: "Completed",
  },
  {
    day: "3 Days Ago",
    status: "Missed Asr",
  },
  {
    day: "4 Days Ago",
    status: "Completed",
  },
  {
    day: "5 Days Ago",
    status: "Completed",
  },
];

export default function PrayerHistory() {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
      <SectionHeader
        title="Recent History"
        subtitle="Review your recent prayer activity."
      />

      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.day}
            className="flex items-center justify-between rounded-2xl border border-[#172235] bg-[#081522] p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-md"
          >
            <span className="font-semibold text-white">
              {item.day}
            </span>

            <span
              className={`font-medium ${
                item.status.includes("Completed")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}