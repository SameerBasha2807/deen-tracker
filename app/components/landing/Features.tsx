import {
  BookOpen,
  HeartHandshake,
  BarChart3,
  Goal,
  MoonStar,
  Hand,
} from "lucide-react";

import FeatureCard from "./FeatureCard";
import HeroBackground from "./HeroBackground";

const features = [
  {
    title: "Prayer Tracking",
    description:
      "Track your five daily prayers, Sunnah, Witr and Tahajjud with beautiful progress indicators.",
    icon: <MoonStar className="h-7 w-7" />,
  },
  {
    title: "Quran Progress",
    description:
      "Monitor your Quran reading, bookmarks, Juz progress and daily goals.",
    icon: <BookOpen className="h-7 w-7" />,
  },
  {
    title: "Dhikr Counter",
    description:
      "Complete your morning and evening adhkar with an elegant digital tasbeeh.",
    icon: <Hand className="h-7 w-7" />,
  },
  {
    title: "Charity",
    description:
      "Track Sadaqah, Zakat and monthly giving with detailed insights.",
    icon: <HeartHandshake className="h-7 w-7" />,
  },
  {
    title: "Goals",
    description:
      "Build consistent Islamic habits with customizable daily and weekly goals.",
    icon: <Goal className="h-7 w-7" />,
  },
  {
    title: "Analytics",
    description:
      "Visualize your worship consistency through charts, streaks and reports.",
    icon: <BarChart3 className="h-7 w-7" />,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#030712] py-28"
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Features
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Everything You Need
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            DeenTracker combines worship tracking, habit building,
            insightful analytics and progress visualization into one
            beautiful experience.
          </p>
        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}