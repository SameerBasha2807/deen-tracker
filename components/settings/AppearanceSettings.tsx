import { Monitor, Moon, Sun } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function AppearanceSettings() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Appearance"
        subtitle="Customize how DeenTracker looks and feels."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {/* Dark Mode */}
        <button
          type="button"
          className="rounded-2xl border border-emerald-500/50 bg-[#081522] p-6 text-left transition hover:bg-[#0A1928]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Moon
              size={24}
              className="text-emerald-400"
            />
          </div>

          <h3 className="mt-5 font-semibold text-white">
            Dark
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Best for a comfortable experience at night.
          </p>
        </button>

        {/* Light Mode */}
        <button
          type="button"
          className="rounded-2xl border border-[#172235] bg-[#081522] p-6 text-left transition hover:border-emerald-500/40 hover:bg-[#0A1928]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/30">
            <Sun
              size={24}
              className="text-slate-300"
            />
          </div>

          <h3 className="mt-5 font-semibold text-white">
            Light
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Use a bright and clean interface.
          </p>
        </button>

        {/* System */}
        <button
          type="button"
          className="rounded-2xl border border-[#172235] bg-[#081522] p-6 text-left transition hover:border-emerald-500/40 hover:bg-[#0A1928]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/30">
            <Monitor
              size={24}
              className="text-slate-300"
            />
          </div>

          <h3 className="mt-5 font-semibold text-white">
            System
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Follow your device's appearance setting.
          </p>
        </button>
      </div>
    </DashboardCard>
  );
}