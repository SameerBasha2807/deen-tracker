type Props = {
  rows?: number;
};

export default function LoadingSkeleton({
  rows = 4,
}: Props) {
  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="animate-pulse">

        <div className="h-8 w-48 rounded bg-slate-200" />

        <div className="mt-8 space-y-5">

          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="h-14 rounded-xl bg-slate-200"
            />
          ))}

        </div>

      </div>
    </div>
  );
}