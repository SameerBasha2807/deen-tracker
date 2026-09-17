import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import QuranHero from "@/components/quran/QuranHero";
import QuranProgress from "@/components/quran/QuranProgress";
import ReadingStreak from "@/components/quran/ReadingStreak";
import ReadingHeatmap from "@/components/quran/ReadingHeatmap";
import LogQuranReading from "@/components/quran/LogQuranReading";
import SurahTracker from "@/components/quran/SurahTracker";
import QuranTemplates from "@/components/quran/QuranTemplates";
export default function QuranPage() {
  return (
    <main className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <div className="space-y-8 p-8">
          <QuranHero />
          <LogQuranReading />
          <QuranTemplates />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <QuranProgress />
            <ReadingStreak />
          </div>
          <ReadingHeatmap />
        </div>
      </div>
    </main>
  );
}