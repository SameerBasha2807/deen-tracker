import {
  ShieldCheck,
  Lock,
  Cloud,
  Smartphone,
} from "lucide-react";

import HeroBackground from "./HeroBackground";

const items = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your worship data stays private and secure.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description:
      "Protected with Firebase Authentication.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description:
      "Access your progress from anywhere.",
  },
  {
    icon: Smartphone,
    title: "Responsive",
    description:
      "Optimized for desktop, tablet and mobile.",
  },
];

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            Why DeenTracker
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Built for Trust
          </h2>

          <p className="mt-6 text-lg text-slate-400">
            Designed with privacy, security and simplicity at its core.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-3xl
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
                  hover:shadow-emerald-500/10
                "
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                  <Icon className="h-7 w-7 text-emerald-400" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}