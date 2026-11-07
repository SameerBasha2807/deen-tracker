type Props = {
  label: string;
  value: number;
};

export default function ProgressBar({
  label,
  value,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-300">
          {label}
        </span>

        <span className="font-semibold text-emerald-400">
          {value}%
        </span>
      </div>

      <div className="h-3 rounded-full bg-[#172235]">
        <div
          className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}