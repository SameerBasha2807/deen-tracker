import SectionHeader from "@/components/ui/SectionHeader";

const days = Array.from({ length: 35 }, (_, i) => i);

export default function PrayerCalendar() {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Monthly Consistency"
          subtitle="Prayer completion over the last month."
        />

        <span className="rounded-xl border border-[#172235] bg-[#081522] px-4 py-2 text-sm font-medium text-slate-300">
          August 2026
        </span>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-3">
        {days.map((day) => (
          <div
            key={day}
            className={`aspect-square rounded-xl transition-all duration-300 hover:scale-110 ${
              day % 5 === 0
                ? "bg-emerald-600"
                : day % 3 === 0
                ? "bg-emerald-400/70"
                : "bg-[#172235]"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#172235]" />
          None
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-400/70" />
          Partial
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-600" />
          Complete
        </div>
      </div>
    </section>
  );
}