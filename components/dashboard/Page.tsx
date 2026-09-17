import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <div className="flex-1 p-8">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center">
            <h1 className="text-4xl font-bold">
              Dashboard Content Coming Next 🚀
            </h1>

            <p className="mt-4 text-slate-500">
              Prayer widgets, Quran progress, analytics and goals will appear here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
