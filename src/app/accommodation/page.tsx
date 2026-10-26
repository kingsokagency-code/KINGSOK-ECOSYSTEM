"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getCampaignGoal,
  getUsers,
  getCurrentUser,
  switchCurrentUser,
  CampaignGoal,
  UserProfile,
} from "@/lib/accommodation-service";
import {
  Target,
  Sparkles,
  Building,
  Radio,
  Headphones,
  ShieldAlert,
  ArrowRight,
  Award,
  BookOpen,
} from "lucide-react";

export default function AccommodationPortalHome() {
  const [goal, setGoal] = useState<CampaignGoal | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const [g, uList, cur] = await Promise.all([
        getCampaignGoal(),
        getUsers(),
        getCurrentUser(),
      ]);
      setGoal(g);
      setUsers(uList);
      setCurrentUser(cur);
    }
    loadData();
  }, []);

  const handleUserSwitch = async (userId: string) => {
    const updated = await switchCurrentUser(userId);
    setCurrentUser(updated);
  };

  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role as any);
  };

  const accommodatedPct = goal && goal.target_accommodated > 0
    ? Math.min(100, Math.round((goal.current_accommodated / goal.target_accommodated) * 100))
    : 0;

  const reachPct = goal && goal.target_freshers_reach > 0
    ? Math.min(100, Math.round((goal.current_freshers_reach / goal.target_freshers_reach) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <AccommodationNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* CURRENTLY RUNNING PRIMARY GOAL (HERO) */}
        {goal && (
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-[0.04] pointer-events-none text-emerald-400">
              <Target className="w-96 h-96" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-black uppercase tracking-widest text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Active Accommodation Campaign
                </div>

                <span className="text-xs font-mono text-neutral-300 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800">
                  Target: {goal.deadline_text}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-3xl text-white">
                  {goal.title}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mt-2 leading-relaxed">
                  Targeting {goal.target_freshers_reach.toLocaleString()} student leads to guarantee that {goal.target_accommodated.toLocaleString()} students are housed with zero fraud, zero hidden fees, and verified peace of mind.
                </p>
              </div>

              {/* Dynamic Progress Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-2xl">
                {/* Accommodated Meter */}
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-emerald-400">Students Accommodated</span>
                    <span className="font-bold font-mono text-white">
                      {goal.current_accommodated} / {goal.target_accommodated}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${accommodatedPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono text-right font-semibold">
                    {accommodatedPct}% Completed
                  </div>
                </div>

                {/* Freshers Reached Meter */}
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-amber-400">Freshers Reached</span>
                    <span className="font-bold font-mono text-white">
                      {goal.current_freshers_reach.toLocaleString()} / {goal.target_freshers_reach.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${reachPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono text-right font-semibold">
                    {reachPct}% Of Reach Target
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE WORKER IDENTITY & MY REWARDS WALLET */}
        {currentUser && (
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-lg">
                      {currentUser.name}
                    </h3>
                    <span className="text-xs bg-neutral-950 text-neutral-300 font-mono px-2 py-0.5 rounded-md border border-neutral-800">
                      {currentUser.phone}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentUser.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-950 text-emerald-400 border border-emerald-500/30 tracking-wider"
                      >
                        {r.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gold Rewards Wallet Pill */}
              <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2.5 rounded-xl border border-amber-400/30">
                <div className="text-center sm:text-right">
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    My Rewards Wallet
                  </div>
                  <div className="text-sm font-black text-white flex items-center gap-1.5 justify-center sm:justify-end mt-0.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{currentUser.total_points} Points</span>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      (₦{currentUser.cash_value_earned.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Persona Switcher (For Development & Demonstration) */}
                <div className="border-l border-neutral-800 pl-3">
                  <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                    Switch Persona
                  </label>
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleUserSwitch(e.target.value)}
                    className="text-xs font-semibold bg-neutral-900 text-white border border-neutral-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roles.join(", ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DIRECT ROLE WORKSPACE LAUNCHERS */}
            <div className="space-y-3">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-wider block">
                Assigned Role Workspaces (Click to Launch)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Area Controller Workspace */}
                {hasRole("area_controller") && (
                  <Link
                    href="/accommodation/controller"
                    className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Building className="w-5 h-5 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          Active Role
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Area Controller
                      </h4>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Record lodges, caretakers, vacating final-year & transition students, and scout your assigned territory.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Hotliner Workspace */}
                {hasRole("hotliner") && (
                  <Link
                    href="/accommodation/hotliner"
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Radio className="w-5 h-5 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                          Active Role
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Hotliner / Broadcast
                      </h4>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Engage incoming freshers, log WhatsApp group broadcasts, and schedule physical inspections.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Customer Rep Workspace */}
                {hasRole("customer_rep") && (
                  <Link
                    href="/accommodation/customer-rep"
                    className="p-4 rounded-xl bg-neutral-950 border border-amber-400/30 hover:border-amber-400 transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Headphones className="w-5 h-5 text-amber-400" />
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                          Cross-Sector
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Customer Rep Desk
                      </h4>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Register client details and collect direct client feedback across KINGSOK sectors.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Launch Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Admin Command Center */}
                {hasRole("admin") && (
                  <Link
                    href="/accommodation/admin"
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-white transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <ShieldAlert className="w-5 h-5 text-white" />
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                          Administrator
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm">
                        Admin Command Center
                      </h4>
                      <p className="text-[11px] text-neutral-300 leading-snug">
                        Assign multi-roles, review submissions, award merit points, and calibrate campaign targets.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                      <span>Launch Command</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMPACT LINK TO ECOSYSTEM PRINCIPLES & GOVERNANCE */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Governed by the KINGSOK Foundation Charter
              </h4>
              <p className="text-xs text-neutral-400">
                Identity before temptation, systems forming competence, and absolute ground-truth reporting.
              </p>
            </div>
          </div>

          <Link
            href="/#principles"
            className="shrink-0 px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-amber-400 rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1.5"
          >
            <span>View Foundation Principles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
