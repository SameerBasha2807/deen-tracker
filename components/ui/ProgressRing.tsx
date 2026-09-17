type Props = {
  value: number;
};

export default function ProgressRing({
  value,
}: Props) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (value / 100) * circumference;

  return (
    <div className="flex justify-center">
      <svg
        width="140"
        height="140"
        className="-rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          strokeWidth="10"
          className="stroke-slate-200 dark:stroke-slate-700"
          fill="transparent"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          strokeWidth="10"
          className="stroke-emerald-500"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute mt-14 text-center">
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}%
        </p>
      </div>
    </div>
  );
}