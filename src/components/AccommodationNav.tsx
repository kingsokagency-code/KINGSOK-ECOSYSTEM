"use client";

import React, { useEffect, useState } from "react";
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
  Crown,
  LogOut,
} from "lucide-react";
import {
  getCurrentUser,
  logoutCurrentUser,
  UserProfile,
} from "@/lib/accommodation-service";

export default function AccommodationNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const cur = await getCurrentUser();
      setCurrentUser(cur);
    }
    loadUser();
  }, [pathname]);

  const isAdmin = currentUser?.roles.includes("admin");

  const navItems = [
    { label: "Overview & Goals", href: "/accommodation", icon: Home },
    { label: "Area Controller", href: "/accommodation/controller", icon: Building },
    { label: "Hotliner", href: "/accommodation/hotliner", icon: Radio },
    { label: "Customer Rep", href: "/accommodation/customer-rep", icon: Headphones },
    ...(isAdmin ? [{ label: "Admin Center", href: "/accommodation/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors pr-2 sm:pr-3 border-r border-slate-200"
              title="Return to KINGSOK Ecosystem Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ecosystem</span>
            </Link>

            <Link href="/accommodation" className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs shadow-emerald-600/20">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight block">
                  KINGSOK
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-widest block -mt-0.5">
                  Accommodation
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Active User Identity & Log Out */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                  <span className="font-extrabold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-black shrink-0 ${
                      isAdmin
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {isAdmin ? "Admin" : currentUser.roles[0]?.replace("_", " ")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logoutCurrentUser();
                    window.location.href = "/login?portal=staff";
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login?portal=staff"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Staff Login</span>
              </Link>
            )}

            <Link
              href="/accommodation/controller"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Lodge</span>
            </Link>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-200 bg-white scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
