type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function DashboardCard({
  title,
  subtitle,
  children,
}: DashboardCardProps) {
  return (
    <section className="rounded-3xl border border-[#172235] bg-[#07111F] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}