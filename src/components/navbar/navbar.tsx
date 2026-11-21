"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, ShieldCheck, CreditCard, Building2, TrendingUp } from "lucide-react";

interface SolutionItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const solutions: SolutionItem[] = [
  {
    title: "Personal Banking",
    description: "Zero-fee checking, high-yield savings, and instant transfers.",
    href: "/solutions/personal",
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: "Business Treasury",
    description: "Multi-currency accounts, corporate cards, and automated payroll.",
    href: "/solutions/business",
    icon: <Building2 className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: "Wealth & Custody",
    description: "Institutional-grade security and automated portfolio growth.",
    href: "/solutions/wealth",
    icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: "Enterprise Security",
    description: "Real-time fraud protection and FDIC-insured accounts.",
    href: "/solutions/security",
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Product", href: "/product" },
    { name: "Customers", href: "/customers" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/75 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-3"
          : "bg-white/60 backdrop-blur-md border-b border-white/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Custom Geometric Bank Logo matching your reference */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 transition-transform duration-300 group-hover:scale-105"
              >
                {/* Top-right dark block */}
                <rect x="14" y="5" width="13" height="13" rx="3.5" fill="#09090B" />
                {/* Bottom vertical pill in deep indigo */}
                <rect x="14" y="14" width="6.5" height="17" rx="3.25" fill="url(#logoGrad)" />
                {/* Left horizontal pill in black */}
                <rect x="7" y="14" width="13.5" height="6.5" rx="3.25" fill="#09090B" />
                <defs>
                  <linearGradient id="logoGrad" x1="14" y1="14" x2="20.5" y2="31" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E1B4B" />
                    <stop offset="1" stopColor="#4338CA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900 hidden sm:block">
              NexaBank
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/product"
              className={`text-sm font-medium transition-colors ${
                pathname === "/product"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              Product
            </Link>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className="flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-indigo-950 transition-colors py-2 focus:outline-none"
              >
                <span>Solutions</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    isSolutionsOpen ? "rotate-180 text-indigo-700" : ""
                  }`}
                />
              </button>

              {/* Glassmorphic Mega-Dropdown */}
              {isSolutionsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[440px]">
                  <div className="rounded-2xl bg-white/90 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] p-3 grid grid-cols-1 gap-1">
                    {solutions.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-100/80 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-indigo-50/80 border border-indigo-100 group-hover:bg-white transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-slate-900"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Log In & Gradient Pill CTA Button */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-800 underline underline-offset-4 decoration-slate-400 hover:decoration-slate-900 hover:text-slate-950 transition-all"
            >
              Log In
            </Link>

            <Link
              href="/download"
              className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#09090B] via-[#13112B] to-[#312885] hover:brightness-110 shadow-[0_4px_14px_rgba(49,40,133,0.3)] hover:shadow-[0_6px_20px_rgba(49,40,133,0.45)] border border-white/15 transition-all duration-200 active:scale-[0.98]"
            >
              Download Now
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100/80 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <Link
              href="/product"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Product
            </Link>

            {/* Mobile Solutions Accordion */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Solutions
              </p>
              <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                {solutions.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-sm font-medium text-slate-800 hover:text-indigo-700"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200/70 flex flex-col gap-3 px-3">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-slate-800 underline underline-offset-4"
            >
              Log In
            </Link>
            <Link
              href="/download"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-medium text-white rounded-full bg-gradient-to-r from-[#09090B] via-[#13112B] to-[#312885] shadow-md"
            >
              Download Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}