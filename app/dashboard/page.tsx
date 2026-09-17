import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import DashboardHero from "@/components/dashboard/DashboardHero";
import TodaysOverview from "@/components/dashboard/TodaysOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingPrayer from "@/components/dashboard/UpcomingPrayer";
import WeeklySummary from "@/components/dashboard/WeeklySummary";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-[#020914]">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="space-y-8 p-8">
          <DashboardHero />

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