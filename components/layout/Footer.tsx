import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-[#030712] py-12">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <Logo />

        <p className="text-sm text-slate-400">
          © 2026 DeenTracker. Built with sincerity.
        </p>
      </div>
    </footer>
  );
}