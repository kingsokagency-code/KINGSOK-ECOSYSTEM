"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getCampaignGoal,
  getPrinciples,
  getStrategies,
  getUsers,
  getCurrentUser,
  switchCurrentUser,
  CampaignGoal,
  Principle,
  Strategy,
  UserProfile,
} from "@/lib/accommodation-service";
import {
  Target,
  Sparkles,
  ShieldCheck,
  Building,
  Radio,
  Headphones,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Award,
  Coins,
  Compass,
} from "lucide-react";

export default function AccommodationPortalHome() {
  const [goal, setGoal] = useState<CampaignGoal | null>(null);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const [g, p, s, uList, cur] = await Promise.all([
        getCampaignGoal(),
        getPrinciples(),
        getStrategies(),
        getUsers(),
        getCurrentUser(),
      ]);
      setGoal(g);
      setPrinciples(p);
      setStrategies(s);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AccommodationNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* CURRENTLY RUNNING GOAL (HERO) */}
        {goal && (
          <div className="bg-gradient-to-br from-emerald-900 via-kingsok-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-emerald-700/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
              <Target className="w-96 h-96" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Currently Running Primary Goal
                </div>

                <span className="text-xs font-mono text-emerald-200/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                  Target: {goal.deadline_text}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-3xl">
                  {goal.title}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mt-2 leading-relaxed">
                  We are pursuing 5,000 newly admitted and returning university students to guarantee that at least 500 students are housed with zero fraud, zero hidden fees, and absolute peace of mind.
                </p>
              </div>

              {/* Progress Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-2xl">
                {/* Accommodated Meter */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-emerald-200">Students Accommodated</span>
                    <span className="font-bold font-mono">
                      {goal.current_accommodated} / {goal.target_accommodated}
                    </span>
                  </div>
                  <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-green-300 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((goal.current_accommodated / goal.target_accommodated) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-300/80 text-right">
                    {Math.round((goal.current_accommodated / goal.target_accommodated) * 100)}% Completed
                  </div>
                </div>

                {/* Freshers Reached Meter */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-emerald-200">Freshers Reached</span>
                    <span className="font-bold font-mono">
                      {goal.current_freshers_reach.toLocaleString()} / {goal.target_freshers_reach.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-teal-300 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((goal.current_freshers_reach / goal.target_freshers_reach) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-300/80 text-right">
                    {Math.round((goal.current_freshers_reach / goal.target_freshers_reach) * 100)}% Of 5,000 Target
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE WORKER CONTEXT & ROLE SWITCHER */}
        {currentUser && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-lg border border-emerald-200">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {currentUser.name}
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md border border-slate-200">
                      {currentUser.phone}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentUser.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 tracking-wider"
                      >
                        {r.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Rewards Pill */}
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                <div className="text-center sm:text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    My Rewards
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-end">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{currentUser.total_points} Points</span>
                    <span className="text-xs text-emerald-700 font-mono font-bold">
                      (₦{currentUser.cash_value_earned.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Tester Persona Switcher */}
                <div className="border-l border-slate-200 pl-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Switch User
                  </label>
                  <select
                    value={currentUser.id}
                    onChange={(e) => handleUserSwitch(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-600 outline-none"
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

            {/* Direct Role Workspace Launcher */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Your Assigned Role Workspaces (Click to Launch)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Area Controller Workspace */}
                {hasRole("area_controller") && (
                  <Link
                    href="/accommodation/controller"
                    className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-300 hover:border-emerald-500 transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Building className="w-5 h-5 text-emerald-700" />
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                          Active Role
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-2">
                        Area Controller Workspace
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        Record lodges, caretakers, final-year vacating rooms, and scout your assigned zone.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Hotliner Workspace */}
                {hasRole("hotliner") && (
                  <Link
                    href="/accommodation/hotliner"
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-300 hover:border-blue-500 transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Radio className="w-5 h-5 text-blue-700" />
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-200/80 text-blue-900">
                          Active Role
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-2">
                        Hotliner / Blast Workspace
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        Engage incoming freshers, log WhatsApp group broadcasts, and schedule inspections.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-800 group-hover:translate-x-1 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Customer Rep Workspace */}
                {hasRole("customer_rep") && (
                  <Link
                    href="/accommodation/customer-rep"
                    className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300 hover:border-amber-500 transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Headphones className="w-5 h-5 text-amber-700" />
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                          Active Role
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-2">
                        Customer Rep Workspace
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        Verify lodge truthfulness, monitor controller activities, and log student feedback.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}

                {/* Admin Command Center */}
                {hasRole("admin") && (
                  <Link
                    href="/accommodation/admin"
                    className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 hover:border-slate-500 transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <ShieldAlert className="w-5 h-5 text-emerald-400" />
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-500/30">
                          Administrator
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm mt-2">
                        Admin Command Center
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Assign multi-roles, rate worker submissions, award points, and edit goals.
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Open Admin Control</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3 CORE PRINCIPLES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-kingsok-700" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              The 3 Operational Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {principles.map((pr) => (
              <div
                key={pr.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-7 h-7 rounded-full bg-kingsok-100 text-kingsok-800 font-black text-xs flex items-center justify-center">
                    0{pr.id}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {pr.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pr.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPERATIONAL STRATEGIES & PLAYBOOKS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-kingsok-700" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Operational Playbooks & Strategies
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Editable by Admin to match field realities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {strategies.map((strat) => (
              <div
                key={strat.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3"
              >
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                  {strat.category.replace("_", " ")}
                </span>

                <h3 className="font-bold text-slate-900 text-sm">
                  {strat.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {strat.summary}
                </p>

                <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Execution Steps:
                  </span>
                  {strat.action_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-kingsok-700 font-bold">•</span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM QUICK LAUNCH BAR */}
        <div className="bg-gradient-to-r from-emerald-800 to-kingsok-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-base">Ready to record lodge data or fresher leads?</h4>
            <p className="text-xs text-emerald-100">
              Every verified submission adds to your score, rating, and performance rewards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/accommodation/controller"
              className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              Area Controller Mode &rarr;
            </Link>
            <Link
              href="/accommodation/hotliner"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs border border-emerald-500/40 transition-colors"
            >
              Hotliner Mode &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
