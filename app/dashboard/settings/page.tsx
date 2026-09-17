import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

import SettingsHero from "@/components/settings/SettingsHero";
import AccountSettings from "@/components/settings/AccountSettings";
import PrayerSettings from "@/components/settings/PrayerSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import QuranSettings from "@/components/settings/QuranSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";

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