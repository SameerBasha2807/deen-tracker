import { MapPin, MoonStar, Clock3 } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function PrayerSettings() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Prayer Settings"
        subtitle="Configure your prayer times and calculation preferences."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <MapPin className="text-emerald-400" size={24} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Location
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Kurnool, Andhra Pradesh
              </p>
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl border border-[#172235] py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400">
            Change Location
          </button>
        </div>

        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <MoonStar className="text-emerald-400" size={24} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Calculation Method
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Muslim World League
              </p>
            </div>
          </div>

          <select
            defaultValue="mwl"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="mwl">
              Muslim World League
            </option>

            <option value="isna">
              ISNA
            </option>

            <option value="egypt">
              Egyptian General Authority
            </option>

            <option value="karachi">
              University of Islamic Sciences, Karachi
            </option>
          </select>
        </div>

        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Clock3 className="text-emerald-400" size={24} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Madhab
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Asr calculation preference
              </p>
            </div>
          </div>

          <select
            defaultValue="standard"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="standard">
              Standard
            </option>

            <option value="hanafi">
              Hanafi
            </option>
          </select>
        </div>

        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Clock3 className="text-emerald-400" size={24} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Prayer Adjustments
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Fine-tune calculated prayer times.
              </p>
            </div>
          </div>

          <button className="mt-5 w-full rounded-xl border border-[#172235] py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400">
            Adjust Times
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}