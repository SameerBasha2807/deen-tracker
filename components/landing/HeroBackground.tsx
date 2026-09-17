export default function HeroBackground() {
  return (
    <>
      {/* Top Right Glow */}
      <div className="absolute right-0 top-0 h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[180px]" />

      {/* Bottom Left Glow */}
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />

      {/* Center Glow */}
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 blur-[140px]" />

      {/* Top Left Accent */}
      <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-emerald-400/5 blur-[140px]" />

      {/* Bottom Right Accent */}
      <div className="absolute -bottom-24 right-20 h-80 w-80 rounded-full bg-sky-500/5 blur-[160px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </>
  );
}