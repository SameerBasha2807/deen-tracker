const stats = [
  {
    title: "Completion",
    value: "92%",
    color: "bg-emerald-100",
  },
  {
    title: "Current Streak",
    value: "18 Days",
    color: "bg-blue-100",
  },
  {
    title: "Missed",
    value: "3",
    color: "bg-red-100",
  },
  {
    title: "Qaza",
    value: "5",
    color: "bg-yellow-100",
  },
];

export default function PrayerStats() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} rounded-3xl p-6 shadow-sm`}
        >
          <p className="text-sm text-gray-600">
            {stat.title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {stat.value}
          </h2>
        </div>
      ))}
    </section>
  );
}