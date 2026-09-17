"use client";

import Link from "next/link";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Analytics", href: "/analytics" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        border-b
        border-white/10
        bg-[#07121D]/80
        backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-all duration-300 hover:text-emerald-400"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">

          

         <Link href="/login"
          className="rounded-xl px-4 py-2 text-slate-300 hover:bg-[#1F2937] hover:text-white">
  Login
</Link>

          <Link href ="/register" className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30">
            Get Started
          </Link>

        </div>

        {/* Mobile Menu */}
        <button className="text-slate-300 transition hover:text-white lg:hidden">
          <Menu className="h-6 w-6" />
        </button>

      </div>
    </header>
  );
}