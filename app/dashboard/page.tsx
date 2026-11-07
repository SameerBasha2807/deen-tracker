import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import DashboardHero from "@/app/components/dashboard/DashboardHero";
import WuduTracker from "@/app/components/dashboard/WuduTracker-temp";
import TodaysOverview from "@/app/components/dashboard/TodaysOverview";
import QuickActions from "@/app/components/dashboard/QuickActions";
import UpcomingPrayer from "@/app/components/dashboard/UpcomingPrayer";
import WeeklySummary from "@/app/components/dashboard/WeeklySummary";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-[#020914]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="space-y-8 p-8">
          <DashboardHero />
          <WuduTracker />
          <TodaysOverview />

          <div className="grid gap-8 xl:grid-cols-2">
            <WeeklySummary />
            <UpcomingPrayer />
          </div>

          <QuickActions />
        </div>
      </div>
    </main>
  );
}