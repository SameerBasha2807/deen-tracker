import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Features from "@/components/landing/Features";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      {/* Back Button */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-white transition hover:border-emerald-500 hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>

      <Features />
    </main>
  );
}