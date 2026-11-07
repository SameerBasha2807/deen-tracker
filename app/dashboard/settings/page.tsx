import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";

import SettingsHero from "@/app/components/settings/SettingsHero";
import AccountSettings from "@/app/components/settings/AccountSettings";
import PrayerSettings from "@/app/components/settings/PrayerSettings";
import NotificationSettings from "@/app/components/settings/NotificationSettings";
import QuranSettings from "@/app/components/settings/QuranSettings";
import AppearanceSettings from "@/app/components/settings/AppearanceSettings";
import PrivacySettings from "@/app/components/settings/PrivacySettings";

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen bg-[#020914]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="space-y-8 p-8">
          <SettingsHero />

          <AccountSettings />

          <PrayerSettings />

          <NotificationSettings />

          <QuranSettings />

          <AppearanceSettings />

          <PrivacySettings />
        </div>
      </div>
    </main>
  );
}