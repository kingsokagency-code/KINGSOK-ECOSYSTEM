"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getCampaignGoal,
  getUsers,
  getCurrentUser,
  switchCurrentUser,
  logoutCurrentUser,
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
  LogIn,
  UserPlus,
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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans">
      <AccommodationNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* CURRENTLY RUNNING PRIMARY GOAL (HERO) */}
        {goal && (
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-10 pointer-events-none text-white">
              <Target className="w-96 h-96" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-xs font-black uppercase tracking-widest text-emerald-200 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Active Accommodation Campaign
                </div>

                <span className="text-xs font-mono text-emerald-100 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
                  Target: {goal.deadline_text}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-3xl text-white">
                  {goal.title}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-2 leading-relaxed">
                  Targeting {goal.target_freshers_reach.toLocaleString()} student leads to guarantee that {goal.target_accommodated.toLocaleString()} students are housed with zero fraud, zero hidden fees, and verified peace of mind.
                </p>
              </div>

              {/* Dynamic Progress Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-2xl">
                {/* Accommodated Meter */}
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-emerald-300">Students Accommodated</span>
                    <span className="font-bold font-mono text-white">
                      {goal.current_accommodated} / {goal.target_accommodated}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-900/80 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-700/60">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${accommodatedPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-300 font-mono text-right font-semibold">
                    {accommodatedPct}% Completed
                  </div>
                </div>

                {/* Freshers Reached Meter */}
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-amber-300">Freshers Reached</span>
                    <span className="font-bold font-mono text-white">
                      {goal.current_freshers_reach.toLocaleString()} / {goal.target_freshers_reach.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-900/80 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-700/60">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${reachPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-amber-300 font-mono text-right font-semibold">
                    {reachPct}% Of Reach Target
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE WORKER IDENTITY & MY REWARDS WALLET */}
        {currentUser ? (
          currentUser.status === "pending_approval" || currentUser.roles.includes("pending") ? (
            /* PENDING ADMIN APPROVAL STATE */
            <div className="bg-white rounded-3xl border border-amber-300 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-xl shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-xl">
                        {currentUser.name}
                      </h3>
                      <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                        Pending Admin Assignment
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Phone: {currentUser.phone} &bull; WhatsApp: {currentUser.whatsapp_phone || currentUser.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                  >
                    Check Status / Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutCurrentUser();
                      window.location.reload();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              {/* Orientation Notice */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 text-sm font-extrabold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Welcome to the KINGSOK Ecosystem & Workforce</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Your staff profile has been registered in the system. The Executive Office (Admin Okoye) has been notified to verify your account and assign your official operational role (<strong>{currentUser.desired_role ? currentUser.desired_role.replace("_", " ") : "Area Controller"}</strong>) and territory (<strong>{currentUser.zone_preference || "Hilltop Zone"}</strong>).
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`https://wa.me/2348103415600?text=Hello%20Admin%20Okoye,%20I%20have%20registered%20as%20a%20staff%20member%20on%20KINGSOK%20Ecosystem.%20My%20name%20is%20${encodeURIComponent(currentUser.name)}%20(${encodeURIComponent(currentUser.phone)}).%20Please%20assign%20my%20role.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Notify Admin (Okoye) on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-slate-500 text-[11px]">
                    Once approved, your operational workspace will unlock here automatically.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE WORKER STATE */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-lg shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        {currentUser.name}
                      </h3>
                      <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md border border-slate-200">
                        {currentUser.phone}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
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

                {/* Gold Rewards Wallet Pill */}
                <div className="flex items-center gap-4 bg-amber-50/80 px-4 py-2.5 rounded-xl border border-amber-300">
                  <div className="text-center sm:text-right">
                    <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                      My Rewards Wallet
                    </div>
                    <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 justify-center sm:justify-end mt-0.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{currentUser.total_points} Points</span>
                      <span className="text-xs text-amber-700 font-mono font-bold">
                        (₦{currentUser.cash_value_earned.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      logoutCurrentUser();
                      window.location.reload();
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 pl-3 border-l border-amber-200"
                    title="Log Out"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              {/* DIRECT ROLE WORKSPACE LAUNCHERS */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  Your Assigned Role Workspaces (Click to Launch)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Area Controller Workspace */}
                  {hasRole("area_controller") && (
                    <Link
                      href="/accommodation/controller"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-500 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Building className="w-5 h-5 text-emerald-600" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active Role
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Area Controller
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Record lodges, caretakers, vacating final-year & transition students, and scout your assigned territory.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                        <span>Launch Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )}

                  {/* Hotliner Workspace */}
                  {hasRole("hotliner") && (
                    <Link
                      href="/accommodation/hotliner"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-500 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Radio className="w-5 h-5 text-emerald-600" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            Active Role
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Hotliner / Broadcast
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Engage incoming freshers, log WhatsApp group broadcasts, and schedule physical inspections.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                        <span>Launch Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )}

                  {/* Customer Rep Workspace */}
                  {hasRole("customer_rep") && (
                    <Link
                      href="/accommodation/customer-rep"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Headphones className="w-5 h-5 text-amber-600" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Cross-Sector
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Customer Rep Desk
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Register client details and collect direct client feedback across KINGSOK sectors.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                        <span>Launch Desk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )}

                  {/* Admin Command Center */}
                  {hasRole("admin") && (
                    <Link
                      href="/accommodation/admin"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-800 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <ShieldAlert className="w-5 h-5 text-slate-800" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            Administrator
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Admin Command Center
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Assign multi-roles, review submissions, award merit points, and calibrate campaign targets.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform">
                        <span>Launch Command</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          /* GUEST / UNAUTHENTICATED STATE */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-xs">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl">
                Staff Identity & Workspace Access
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                Welcome to the KINGSOK Accommodation workforce system. Please sign in with your staff account or register your staff profile to access assigned field workspaces.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/login?portal=staff"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Sign In</span>
              </Link>
              <Link
                href="/login?portal=staff&mode=register"
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Register as New Staff</span>
              </Link>
              <Link
                href="/login?portal=admin"
                className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Access</span>
              </Link>
            </div>
          </div>
        )}

        {/* COMPACT LINK TO ECOSYSTEM PRINCIPLES & GOVERNANCE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Governed by the KINGSOK Foundation Charter
              </h4>
              <p className="text-xs text-slate-500">
                Identity before temptation, systems forming competence, and absolute ground-truth reporting.
              </p>
            </div>
          </div>

          <Link
            href="/#principles"
            className="shrink-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>View Foundation Principles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
