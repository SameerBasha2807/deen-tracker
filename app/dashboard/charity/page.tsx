"use client";

import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import CharityTracker from "@/components/charity/CharityTracker";
import { useAuth } from "@/contexts/AuthContext";

export default function CharityPage() {
  const { user, loading } = useAuth();

  if (loading) return <main className="min-h-screen bg-[#030712] p-8 text-slate-300">Loading…</main>;
  
  return (
    <main className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <div className="space-y-8 p-8">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-emerald-100">Charity Dashboard</p>
                <h1 className="mt-2 text-4xl font-bold">Track Your Sadaqah</h1>
                <p className="mt-3 max-w-xl text-emerald-100">
                  "The believer's shade on the Day of Resurrection will be his charity." 
                  <span className="block text-sm mt-1 opacity-80">— Tirmidhi</span>
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
  <p className="text-sm text-emerald-100">
    Your Charity
  </p>

  <h2 className="text-3xl font-bold">
    🤲
  </h2>

  <p className="mt-1 text-sm text-emerald-100">
    Every contribution counts
  </p>
</div>
            </div>
          </section>
          
          {user ? (
            <CharityTracker userId={user.uid} />
          ) : (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
              <p>Sign in to save and view your charity records.</p>
              <Link href="/auth" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500">
                Sign in or create an account
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
