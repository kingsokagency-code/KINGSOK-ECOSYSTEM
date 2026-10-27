"use client";

import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  Check,
  Crown,
  LogOut,
} from "lucide-react";
import {
  getCurrentUser,
  getUsers,
  switchCurrentUser,
  logoutCurrentUser,
  UserProfile,
} from "@/lib/accommodation-service";

export default function AccommodationNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const [cur, uList] = await Promise.all([getCurrentUser(), getUsers()]);
      setCurrentUser(cur);
      setUsers(uList);
    }
    loadUser();
  }, [pathname]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = async (userId: string) => {
    try {
      await switchCurrentUser(userId);
      setIsDropdownOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch persona:", err);
    }
  };

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

          {/* Right Action: Active User Persona Switcher & Log Lodge */}
          <div className="flex items-center gap-2">
            {/* Active User Persona Dropdown or Login Button */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-xs"
                  title="Active Workspace Persona (Click to switch user)"
                >
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                  <span className="font-extrabold text-slate-900 truncate max-w-[90px] sm:max-w-[120px]">
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
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-2 border-b border-slate-100 pb-2.5 mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Logged-In Persona
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{currentUser.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">{currentUser.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {currentUser.roles.map((r) => (
                          <span
                            key={r}
                            className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {r.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block px-2 mb-1.5">
                      Switch Persona (Auto-Personalizes)
                    </span>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {users.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        const userIsAdmin = u.roles.includes("admin");
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u.id)}
                            className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isCurrent
                                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                {userIsAdmin && (
                                  <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                                )}
                                <span className="block font-bold text-slate-900 text-xs truncate">
                                  {u.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 block -mt-0.5 capitalize">
                                {u.roles.map((r) => r.replace("_", " ")).join(", ")}
                              </span>
                            </div>
                            {isCurrent && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 px-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          logoutCurrentUser();
                          setIsDropdownOpen(false);
                          window.location.reload();
                        }}
                        className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3 text-rose-600" />
                        <span>Log Out</span>
                      </button>

                      <Link
                        href="/login"
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        Switch Account / Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
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
