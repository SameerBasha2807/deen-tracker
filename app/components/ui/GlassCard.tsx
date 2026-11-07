import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
      rounded-3xl
      border
      border-white/10
      bg-white/70
      backdrop-blur-xl
      shadow-xl
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-2xl
      ${className}
    `}
    >
      {children}
    </div>
  );
}