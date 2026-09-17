import { Clock3 } from "lucide-react";

export default function NextPrayer() {
  return (
    <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <Clock3 />

        <h2 className="text-xl font-bold">
          Next Prayer
        </h2>
      </div>

      <h1 className="mt-8 text-4xl font-bold">
        Maghrib
      </h1>

      <p className="mt-3 text-emerald-100">
        Starts in
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        01:12:35
      </h2>
    </div>
  );
}