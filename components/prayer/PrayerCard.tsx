import SectionHeader from "@/components/ui/SectionHeader";

const prayers = [
  {
    name: "Fajr",
    time: "5:08 AM",
    status: "Completed",
    color: "text-emerald-400",
    icon: "✅",
  },
  {
    name: "Dhuhr",
    time: "12:35 PM",
    status: "Completed",
    color: "text-emerald-400",
    icon: "✅",
  },
  {
    name: "Asr",
    time: "4:15 PM",
    status: "Next Prayer",
    color: "text-emerald-400",
    icon: "⏳",
  },
  {
    name: "Maghrib",
    time: "6:52 PM",
    status: "Pending",
    color: "text-slate-400",
    icon: "⭕",
  },
  {
    name: "Isha",
    time: "8:15 PM",
    status: "Pending",
    color: "text-slate-400",
    icon: "⭕",
  },
];

export default function PrayerCard() {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
      <SectionHeader
        title="Today's Prayers"
        subtitle="Track all five daily prayers."
      />

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <div
            key={prayer.name}
            className="flex items-center justify-between rounded-2xl border border-[#172235] bg-[#081522] p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-[#0A1928] hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                {prayer.icon}
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {prayer.name}
                </h3>

                <p className="text-sm text-slate-400">
                  {prayer.time}
                </p>
              </div>
            </div>

            <span className={`font-medium ${prayer.color}`}>
              {prayer.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}