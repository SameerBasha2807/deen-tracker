import SectionHeader from "@/components/ui/SectionHeader";

const prayers = [
  {
    name: "Fajr",
    completed: true,
    time: "5:08 AM",
  },
  {
    name: "Dhuhr",
    completed: true,
    time: "12:35 PM",
  },
  {
    name: "Asr",
    completed: false,
    time: "4:15 PM",
  },
  {
    name: "Maghrib",
    completed: false,
    time: "6:52 PM",
  },
  {
    name: "Isha",
    completed: false,
    time: "8:15 PM",
  },
];

export default function PrayerTimeline() {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
      <SectionHeader
        title="Prayer Timeline"
        subtitle="Track today's Salah progress."
      />

      <div className="relative mt-10">
        {/* Timeline background */}
        <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-[#172235]" />

        <div className="relative flex justify-between">
          {prayers.map((prayer) => (
            <div
              key={prayer.name}
              className="flex flex-col items-center"
            >
              <div
                className={`z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#07111F] text-lg font-bold shadow-md ${
                  prayer.completed
                    ? "bg-emerald-500 text-white"
                    : "bg-[#172235] text-slate-400"
                }`}
              >
                {prayer.completed ? "✓" : "•"}
              </div>

              <h3 className="mt-4 font-semibold text-white">
                {prayer.name}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {prayer.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}