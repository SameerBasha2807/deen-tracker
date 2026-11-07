import {
  BookOpen,
  Clock3,
  Flame,
  Trophy,
} from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    title: "Pages Read",
    value: "842",
  },
  {
    icon: Clock3,
    title: "Minutes",
    value: "1,260",
  },
  {
    icon: Flame,
    title: "Current Streak",
    value: "27 Days",
  },
  {
    icon: Trophy,
    title: "Khatam",
    value: "2",
  },
];

export default function ReadingStats() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="rounded-3xl border border-[#172235] bg-[#07111F] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Icon className="text-emerald-400" />
            </div>

            <h2 className="mt-6 text-4xl font-bold text-white">
              {item.value}
            </h2>

            <p className="mt-2 text-slate-400">
              {item.title}
            </p>
          </div>
        );
      })}
    </section>
  );
}