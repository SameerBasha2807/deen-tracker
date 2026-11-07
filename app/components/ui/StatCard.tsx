import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  value: string;
};

export default function StatCard({
  icon: Icon,
  title,
  value,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#3A3018] bg-[#36454F] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
        <Icon
          size={26}
          className="text-[#D4AF37]"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[#F5E6A8]">
        {title}
      </h3>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}