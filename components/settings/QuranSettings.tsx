import {
  BookOpen,
  Languages,
  Target,
  Type,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function QuranSettings() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Quran"
        subtitle="Customize your Quran reading experience."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {/* Daily Reading Goal */}
        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Target
                size={24}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Daily Reading Goal
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Set your daily Quran reading target.
              </p>
            </div>
          </div>

          <select
            defaultValue="5"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="3">3 Pages</option>
            <option value="5">5 Pages</option>
            <option value="10">10 Pages</option>
            <option value="15">15 Pages</option>
            <option value="20">20 Pages</option>
          </select>
        </div>

        {/* Translation */}
        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Languages
                size={24}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Translation
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Choose your preferred translation.
              </p>
            </div>
          </div>

          <select
            defaultValue="sahih"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="sahih">
              Sahih International
            </option>

            <option value="pickthall">
              Pickthall
            </option>

            <option value="yusufali">
              Yusuf Ali
            </option>
          </select>
        </div>

        {/* Arabic Text Size */}
        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Type
                size={24}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Arabic Text Size
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Adjust the Arabic Quran font size.
              </p>
            </div>
          </div>

          <select
            defaultValue="medium"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">
              Extra Large
            </option>
          </select>
        </div>

        {/* Reading Reminder */}
        <div className="rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <BookOpen
                size={24}
                className="text-emerald-400"
              />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Reading Reminder
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Choose when to receive your Quran reminder.
              </p>
            </div>
          </div>

          <input
            type="time"
            defaultValue="20:00"
            className="mt-5 w-full rounded-xl border border-[#172235] bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
          />
        </div>
      </div>
    </DashboardCard>
  );
}