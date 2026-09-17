import {
  Database,
  Download,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function PrivacySettings() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Privacy & Data"
        subtitle="Control your personal data and account information."
      />

      <div className="space-y-5">
        {/* Privacy */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck
              size={24}
              className="text-emerald-400"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Privacy
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Manage how your personal information is handled.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Manage
          </button>
        </div>

        {/* Export Data */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Download
              size={24}
              className="text-emerald-400"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Export Your Data
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Download your prayer, Quran, goals, and activity data.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Export
          </button>
        </div>

        {/* Activity Data */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Database
              size={24}
              className="text-emerald-400"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Activity Data
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Manage your stored worship and progress history.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Manage
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
            <Trash2
              size={24}
              className="text-red-400"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-white">
              Delete Account
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Permanently delete your account and stored data.
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}