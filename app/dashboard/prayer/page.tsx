import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

import DailyPrayerTracker from "@/components/prayer/DailyPrayerTracker";

export default function PrayerPage() {
  return (
    <main className="flex min-h-screen bg-[#020914]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="p-4 sm:p-8"><DailyPrayerTracker /></div>
      </div>
    </main>
  );
}
