import { UserCircle, Mail, Lock } from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function AccountSettings() {
  return (
    <DashboardCard>
      <SectionHeader
        title="Account"
        subtitle="Manage your personal account information."
      />

      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <UserCircle className="text-emerald-400" size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Profile
            </h3>

            <p className="text-sm text-slate-400">
              Manage your name and profile information.
            </p>
          </div>

          <button className="ml-auto rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400">
            Edit
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Mail className="text-emerald-400" size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Email Address
            </h3>

            <p className="text-sm text-slate-400">
              Update the email connected to your account.
            </p>
          </div>

          <button className="ml-auto rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400">
            Change
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#172235] bg-[#081522] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Lock className="text-emerald-400" size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Password
            </h3>

            <p className="text-sm text-slate-400">
              Change your account password.
            </p>
          </div>

          <button className="ml-auto rounded-xl border border-[#172235] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400">
            Change
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}