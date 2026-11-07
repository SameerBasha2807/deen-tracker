import HeroBackground from "./HeroBackground";

const testimonials = [
  {
    name: "Ahmed",
    role: "Student",
    quote:
      "DeenTracker helped me become consistent with my daily prayers. The interface is beautiful and motivates me every day.",
  },
  {
    name: "Fatima",
    role: "Teacher",
    quote:
      "The Quran tracker keeps me accountable. It has become part of my daily routine.",
  },
  {
    name: "Yusuf",
    role: "Software Engineer",
    quote:
      "A clean, modern and distraction-free Islamic productivity app. Exactly what I needed.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Testimonials
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Loved by Users
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Discover how DeenTracker helps Muslims stay consistent with
            worship and build meaningful daily habits.
          </p>
        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {testimonials.map((user) => (
            <div
              key={user.name}
              className="
                rounded-[32px]
                border
                border-slate-800
                bg-slate-900/70
                p-8
                backdrop-blur-xl
                shadow-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-emerald-500/40
                hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)]
              "
            >
              {/* Quote */}

              <p className="text-lg italic leading-8 text-slate-300">
                “{user.quote}”
              </p>

              {/* User */}

              <div className="mt-8 border-t border-slate-800 pt-6">
                <h3 className="text-xl font-bold text-white">
                  {user.name}
                </h3>

                <p className="mt-1 text-slate-400">
                  {user.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}