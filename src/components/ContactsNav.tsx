"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Users, Home, Lock } from "lucide-react";

interface ContactsNavProps {
  totalContacts?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function ContactsNav({
  totalContacts = 0,
  activeTab = "dashboard",
  onTabChange,
}: ContactsNavProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "import", label: "Import & Clean" },
    { id: "directory", label: "Contacts Directory" },
    { id: "batches", label: "Batches & Exports" },
    { id: "messages", label: "Message Assistant" },
    { id: "compliance", label: "Consent & Policy" },
  ];

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors pr-3 border-r border-neutral-800"
              title="Return to KINGSOK Ecosystem Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ecosystem</span>
            </Link>

            <Link href="/accommodation" className="text-neutral-400 hover:text-white text-xs font-semibold hidden lg:flex items-center gap-1 transition-colors pr-3 border-r border-neutral-800">
              <Home className="w-3.5 h-3.5" />
              <span>Accommodation</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm tracking-tight block">
                    KINGSOK
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    CONTACT ORGANIZER
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 block -mt-0.5">
                  Controlled WhatsApp Messaging Assistant
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Stats Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Zero-Cloud Privacy Shield</span>
            </div>

            {totalContacts > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{totalContacts.toLocaleString()} Contacts Loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Row */}
        {onTabChange && (
          <div className="flex space-x-1 overflow-x-auto py-2 border-t border-neutral-900 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                  }`}
                >
                  {tab.label}
                  {tab.id === "batches" && totalContacts > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-emerald-700 text-white" : "bg-neutral-800 text-neutral-400"
                    }`}>
                      256/list
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
