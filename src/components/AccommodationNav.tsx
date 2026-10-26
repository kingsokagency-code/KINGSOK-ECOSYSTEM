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
  User,
  ArrowLeft,
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
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors pr-3 border-r border-neutral-800"
              title="Return to KINGSOK Ecosystem Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ecosystem</span>
            </Link>

            <Link href="/accommodation" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm tracking-tight block">
                  KINGSOK
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block -mt-0.5">
                  Accommodation Sector
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Action */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
            >
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Staff Login</span>
            </Link>
            <Link
              href="/accommodation/controller"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Lodge</span>
            </Link>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-neutral-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
