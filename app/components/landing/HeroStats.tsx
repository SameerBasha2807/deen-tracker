const stats = [
  {
    value: "5",
    label: "Daily Prayers",
  },
  {
    value: "114",
    label: "Surahs",
  },
  {
    value: "∞",
    label: "Spiritual Growth",
  },
];

export default function HeroStats() {
  return (
    <div className="mt-20 grid w-full max-w-3xl grid-cols-3 gap-6">
      {stats.map((item) => (
        <div
          key={item.label}
          className="
            rounded-3xl
            border
            border-slate-800
            bg-slate-900/70
            p-8
            text-center
            backdrop-blur-xl
            shadow-xl
            transition-all
            duration-300
            hover:-translate-y-2
            hover:border-emerald-500/40
            hover:shadow-emerald-500/10
          "
        >
          <h3 className="text-4xl font-extrabold text-white">
            {item.value}
          </h3>

          <p className="mt-3 text-sm font-medium tracking-wide text-slate-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}