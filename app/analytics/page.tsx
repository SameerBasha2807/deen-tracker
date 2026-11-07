import Sidebar from "@/app/components/dashboard/Sidebar";
import TopBar from "@/app/components/dashboard/TopBar";
import AnalyticsHero from "@/app/components/analytics/AnalyticsHero";
import WorshipScore from "@/app/components/analytics/WorshipScore";
import WeeklyAnalytics from "@/app/components/analytics/WeeklyAnalytics";
import WeeklyChart from "@/app/components/analytics/WeeklyChart";
import Heatmap from "@/app/components/analytics/Heatmap";
import PrayerVsQuran from "@/app/components/analytics/PrayerVsQuran";
import Insights from "@/app/components/analytics/Insights";
import AchievementCard from "@/app/components/analytics/AchievementCard";
import RecentActivity from "@/app/components/analytics/RecentActivity";
import StreakOverview from "@/app/components/analytics/StreakOverview";

export default function AnalyticsPage() {
  return (
    <main className="flex min-h-screen bg-[#030712] text-white">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-[#030712]">
        <TopBar />

        <div className="flex-1 space-y-8 bg-[#030712] p-8">
          <AnalyticsHero />

          <WorshipScore />

          <WeeklyAnalytics />

          <WeeklyChart />

          <PrayerVsQuran />

          <Heatmap />

          <Insights />

          <AchievementCard />

          <RecentActivity />

          <StreakOverview />
        </div>
      </div>
    </main>
  );
}