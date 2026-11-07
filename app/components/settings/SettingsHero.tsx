import { Settings } from "lucide-react";

export default function SettingsHero() {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Settings
            size={32}
            className="text-emerald-400"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white">
            Settings
          </h1>

          <p className="mt-2 text-slate-400">
            Personalize your DeenTracker experience.
          </p>
        </div>
      </div>
    </section>
  );
}