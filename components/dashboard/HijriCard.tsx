import { CalendarDays } from "lucide-react";

export default function HijriCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-7 w-7 text-sky-500" />

        <div>
          <h2 className="text-xl font-bold">
            Hijri Date
          </h2>

          <p className="text-sm text-slate-500">
            Islamic Calendar
          </p>
        </div>
      </div>

      <h3 className="mt-8 text-3xl font-bold">
        12 Safar
      </h3>

      <p className="mt-2 text-slate-500">
        1448 AH
      </p>
    </div>
  );
}