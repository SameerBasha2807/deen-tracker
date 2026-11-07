import Link from "next/link";
import { MoonStar } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
        <MoonStar className="h-5 w-5" />
      </div>

      <div className="leading-tight">
        <h1 className="text-lg font-bold tracking-tight text-[#D4AF37]">
          DeenTracker
        </h1>

        <p className="text-xs text-[#D4AF37]">
          Build Consistency
        </p>
      </div>
    </Link>
  );
}