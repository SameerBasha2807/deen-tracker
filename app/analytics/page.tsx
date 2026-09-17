import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import AnalyticsHero from "@/components/analytics/AnalyticsHero";
import WorshipScore from "@/components/analytics/WorshipScore";
import WeeklyAnalytics from "@/components/analytics/WeeklyAnalytics";
import WeeklyChart from "@/components/analytics/WeeklyChart";
import Heatmap from "@/components/analytics/Heatmap";
import PrayerVsQuran from "@/components/analytics/PrayerVsQuran";
import Insights from "@/components/analytics/Insights";
import AchievementCard from "@/components/analytics/AchievementCard";
import RecentActivity from "@/components/analytics/RecentActivity";
import StreakOverview from "@/components/analytics/StreakOverview";

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