"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building,
  Radio,
  Headphones,
  ShieldAlert,
  Shield,
  PlusCircle,
} from "lucide-react";

export default function AccommodationNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview & Goals", href: "/accommodation", icon: Home },
    { label: "Area Controller", href: "/accommodation/controller", icon: Building },
    { label: "Hotliner", href: "/accommodation/hotliner", icon: Radio },
    { label: "Customer Rep", href: "/accommodation/customer-rep", icon: Headphones },
    { label: "Admin Center", href: "/accommodation/admin", icon: ShieldAlert },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/accommodation" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-200">
              <Shield className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">
                KINGSOK
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider block -mt-0.5">
                Accommodation Sector
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <div className="flex items-center gap-2">
            <Link
              href="/accommodation/controller"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Lodge</span>
            </Link>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-emerald-100 text-emerald-900 font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
