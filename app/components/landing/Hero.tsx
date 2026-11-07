import HeroBadge from "./HeroBadge";
import HeroButtons from "./HeroButtons";
import HeroStats from "./HeroStats";
import DashboardMockup from "./DashboardMockup";
import HeroBackground from "./HeroBackground";

import HeroMoon from "../three/HeroMoon";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28">
      {/* Background */}
      <HeroBackground />

      {/* 3D Moon */}
      <HeroMoon />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        <HeroBadge />

        <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
          Track Your Deen.
          <br />
          Build Consistency.
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-400">
          DeenTracker helps you build lasting Islamic habits by tracking
          prayers, Quran reading, dhikr, charity, goals, and spiritual
          consistency—all in one beautiful, privacy-first app.
        </p>

        <div className="mt-10">
          <HeroButtons />
        </div>

        <div className="mt-12">
          <HeroStats />
        </div>

        <div className="mt-20 w-full">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}