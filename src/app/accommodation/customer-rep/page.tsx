"use client";

import React, { useEffect, useState } from "react";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getLodges,
  verifyLodge,
  getClientLeads,
  getCustomerRepLogs,
  createCustomerRepLog,
  updateCustomerRepLogStatus,
  getCurrentUser,
  LodgeAsset,
  ClientLead,
  CustomerRepLog,
  UserProfile,
} from "@/lib/accommodation-service";
import {
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  PlusCircle,
  Award,
  Sparkles,
  Droplets,
  Zap,
  Building,
  UserCheck,
  Clock,
  X,
  Send,
  MessageSquare,
  ThumbsUp,
  AlertOctagon,
} from "lucide-react";

export default function CustomerRepWorkspace() {
  const [lodges, setLodges] = useState<LodgeAsset[]>([]);
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [repLogs, setRepLogs] = useState<CustomerRepLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"lodges" | "freshers" | "logs">("lodges");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form Fields
  const [modalCategory, setModalCategory] = useState<CustomerRepLog["category"]>("Lodge Verification");
  const [targetReference, setTargetReference] = useState("");
  const [findings, setFindings] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [status, setStatus] = useState<"resolved" | "pending_supervisor">("resolved");

  useEffect(() => {
    async function load() {
      const [lList, leadList, rList, cur] = await Promise.all([
        getLodges(),
        getClientLeads(),
        getCustomerRepLogs(),
        getCurrentUser(),
      ]);
      setLodges(lList);
      setLeads(leadList);
      setRepLogs(rList);
      setCurrentUser(cur);
    }
    load();
  }, []);

  // Quick Verification Toggle for Lodges
  const handleToggleVerification = async (lodge: LodgeAsset) => {
    try {
      const updated = await verifyLodge(lodge.id, !lodge.is_verified);
      setLodges((prev) => prev.map((l) => (l.id === lodge.id ? updated : l)));
      setNotification(
        updated.is_verified
          ? `Lodge "${updated.name}" verified as truthful & ready for freshers!`
          : `Lodge "${updated.name}" marked as requiring further checks.`
      );
    } catch (err: any) {
      alert("Error updating verification: " + err.message);
    }
  };

  // Pre-fill modal for a lodge
  const openModalForLodge = (lodge: LodgeAsset) => {
    setModalCategory("Lodge Verification");
    setTargetReference(lodge.name + " (" + lodge.area + ")");
    setFindings(
      `Called Caretaker ${lodge.caretaker_name} (${lodge.caretaker_phone}). Verified: Rent stated as ${lodge.rent_per_session}, Water: ${lodge.water_reliability}, Light: ${lodge.light_reliability}.`
    );
    setActionTaken("Verified lodge details against field record.");
    setStatus("resolved");
    setIsModalOpen(true);
  };

  // Pre-fill modal for a student
  const openModalForLead = (lead: ClientLead) => {
    setModalCategory("Fresher Feedback");
    setTargetReference(`${lead.fresher_name} (${lead.phone})`);
    setFindings(`Followed up after inspection. Inquired if room condition and price matched controller's representation.`);
    setActionTaken("Recorded feedback and confirmed student satisfaction.");
    setStatus("resolved");
    setIsModalOpen(true);
  };

  // Submit new Quality Log
  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReference.trim() || !findings.trim()) {
      alert("Please provide the target reference and findings.");
      return;
    }

    setSubmitting(true);
    try {
      const newLog = await createCustomerRepLog({
        category: modalCategory,
        target_reference: targetReference.trim(),
        findings: findings.trim(),
        action_taken: actionTaken.trim() || "Recorded in quality log.",
        status,
        rep_name: currentUser?.name || "Customer Rep",
      });

      setRepLogs([newLog, ...repLogs]);
      setNotification(`Quality check record for "${newLog.target_reference}" logged successfully!`);
      setIsModalOpen(false);

      // Reset
      setTargetReference("");
      setFindings("");
      setActionTaken("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle log resolution status
  const handleToggleLogStatus = async (log: CustomerRepLog) => {
    const nextStatus = log.status === "resolved" ? "pending_supervisor" : "resolved";
    try {
      const updated = await updateCustomerRepLogStatus(log.id, nextStatus);
      setRepLogs((prev) => prev.map((l) => (l.id === log.id ? updated : l)));
      setNotification(`Status for "${log.target_reference}" updated to ${nextStatus.replace("_", " ")}.`);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  // Filtered Lodges
  const filteredLodges = lodges.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase()) ||
      l.caretaker_name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.fresher_name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.toLowerCase().includes(search.toLowerCase()) ||
      l.preferred_area.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Filtered Logs
  const filteredLogs = repLogs.filter((l) => {
    const matchSearch =
      l.target_reference.toLowerCase().includes(search.toLowerCase()) ||
      l.findings.toLowerCase().includes(search.toLowerCase()) ||
      l.rep_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || l.category === filterCategory;
    return matchSearch && matchCat;
  });

  const verifiedLodgesCount = lodges.filter((l) => l.is_verified).length;
  const pendingIssuesCount = repLogs.filter((l) => l.status === "pending_supervisor").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AccommodationNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-100 hover:text-white ml-2 text-xs uppercase tracking-wider"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WORKSPACE HEADER */}
        <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-extrabold uppercase tracking-widest text-amber-300">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                Customer Rep & Quality Assurance
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Truth-Checking & Oversight Desk
              </h1>
              <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl leading-relaxed">
                “Don&apos;t hide details. Be truthful always.” We verify caretaker claims, check water and light
                authenticity, follow up with student freshers after visits, and resolve field discrepancies.
              </p>
            </div>

            <button
              onClick={() => {
                setModalCategory("Lodge Verification");
                setTargetReference("");
                setFindings("");
                setActionTaken("");
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Quality Check</span>
            </button>
          </div>
        </div>

        {/* WORKER EARNINGS & KEY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Verified Lodges</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {verifiedLodgesCount} / {lodges.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {Math.round((verifiedLodgesCount / (lodges.length || 1)) * 100)}% Lodges Verified
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Quality Audits</span>
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {repLogs.length}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">
              Checks & follow-ups logged
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Issues</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {pendingIssuesCount}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              Requiring supervisor input
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">My Rewards</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {currentUser?.total_points || 0} Pts
            </div>
            <div className="text-[11px] text-emerald-700 font-mono font-bold mt-1">
              ₦{((currentUser?.total_points || 0) * 1000).toLocaleString()} earned
            </div>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS & SEARCH */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("lodges")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "lodges"
                    ? "bg-amber-100 text-amber-950 border border-amber-300"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Lodge Truth-Checking ({lodges.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("freshers")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "freshers"
                    ? "bg-amber-100 text-amber-950 border border-amber-300"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Fresher Inspection Follow-Up ({leads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-amber-100 text-amber-950 border border-amber-300"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quality Log & Audits ({repLogs.length})</span>
              </button>
            </div>

            {/* Quick Count Badge */}
            <div className="text-[11px] font-mono text-slate-500 text-right">
              {activeTab === "lodges" && `${filteredLodges.length} lodges in registry`}
              {activeTab === "freshers" && `${filteredLeads.length} student leads`}
              {activeTab === "logs" && `${filteredLogs.length} audit logs`}
            </div>
          </div>

          {/* Search bar & Category filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === "lodges"
                    ? "Search lodge name, area, caretaker..."
                    : activeTab === "freshers"
                    ? "Search fresher name, phone, area..."
                    : "Search target reference, findings..."
                }
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none"
              />
            </div>

            {activeTab === "logs" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Lodge Verification">Lodge Verification</option>
                  <option value="Fresher Feedback">Fresher Feedback</option>
                  <option value="Issue Resolution">Issue Resolution</option>
                  <option value="Caretaker Dispute">Caretaker Dispute</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LODGE TRUTH-CHECKING QUEUE */}
        {/* ============================================================== */}
        {activeTab === "lodges" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Ground Intel Scrutiny Queue
              </span>
              <span>Click caretaker number to call & verify facts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLodges.map((lodge) => (
                <div
                  key={lodge.id}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                    lodge.is_verified ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                  }`}
                >
                  {/* Top: Name & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {lodge.name}
                        </h3>
                        {lodge.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Needs Check
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        {lodge.area} &bull; {lodge.address}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block">
                        {lodge.rent_per_session}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {lodge.is_vacant_now ? `${lodge.vacancy_count} rooms vacant` : "Currently full"}
                      </span>
                    </div>
                  </div>

                  {/* Utilities Truth Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        <span>Water Reality</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {lodge.water_reliability}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Power Reality</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {lodge.light_reliability}
                      </div>
                    </div>
                  </div>

                  {/* Key Contacts */}
                  <div className="space-y-1.5 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Caretaker:</span>
                      <a
                        href={`tel:${lodge.caretaker_phone}`}
                        className="font-bold text-slate-900 flex items-center gap-1 text-emerald-700 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {lodge.caretaker_name} ({lodge.caretaker_phone})
                      </a>
                    </div>

                    {lodge.lodge_president_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Lodge President:</span>
                        <a
                          href={`tel:${lodge.lodge_president_phone}`}
                          className="font-semibold text-slate-800 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lodge.lodge_president_name} ({lodge.lodge_president_phone})
                        </a>
                      </div>
                    )}

                    {lodge.has_final_year_students && lodge.final_year_details && (
                      <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg">
                        <span className="font-bold block">Final Year Student Intel:</span>
                        {lodge.final_year_details}
                      </div>
                    )}
                  </div>

                  {/* Submitter & Admin Points */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Scouted by: {lodge.recorded_by_name}</span>
                    {lodge.admin_points_awarded && (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        +{lodge.admin_points_awarded} Pts awarded by Admin
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleVerification(lodge)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        lodge.is_verified
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{lodge.is_verified ? "Revoke Verification" : "Approve as Truthful"}</span>
                    </button>

                    <button
                      onClick={() => openModalForLodge(lodge)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Log Audit</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredLodges.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <Building className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No lodges match your search.</p>
                  <p className="text-xs text-slate-400">All lodges submitted by Area Controllers appear here for audit.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: FRESHER INSPECTION FOLLOW-UP QUEUE */}
        {/* ============================================================== */}
        {activeTab === "freshers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Fresher Post-Inspection Feedback Queue
              </span>
              <span>Verify student received honest pricing and genuine care</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {lead.fresher_name}
                      </h3>
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        lead.status === "payment_completed"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : lead.status === "inspection_scheduled"
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                    >
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Area</span>
                      <span className="font-bold text-slate-800">{lead.preferred_area}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Budget</span>
                      <span className="font-bold text-emerald-700">{lead.budget_range}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Room Desired</span>
                      <span className="font-semibold text-slate-700">{lead.desired_room_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Hotliner</span>
                      <span className="font-semibold text-slate-700">{lead.hotliner_name}</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                      <span className="font-bold text-amber-900 block text-[10px] uppercase">Notes:</span>
                      {lead.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Student</span>
                    </a>

                    <button
                      onClick={() => openModalForLead(lead)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Log Feedback</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredLeads.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No student leads found.</p>
                  <p className="text-xs text-slate-400">Leads captured by Hotliners will appear here for follow-up.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: QUALITY LOG & AUDITS */}
        {/* ============================================================== */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Official Quality & Resolution Log
              </span>
              <span>Accountability stream visible to Admin & Supervisors</span>
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          log.category === "Lodge Verification"
                            ? "bg-blue-100 text-blue-900 border-blue-200"
                            : log.category === "Fresher Feedback"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                            : log.category === "Caretaker Dispute"
                            ? "bg-rose-100 text-rose-900 border-rose-200"
                            : "bg-purple-100 text-purple-900 border-purple-200"
                        }`}
                      >
                        {log.category}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {log.target_reference}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleLogStatus(log)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          log.status === "resolved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        }`}
                      >
                        {log.status === "resolved" ? "Resolved" : "Pending Supervisor"}
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Findings:</span>
                      <p className="text-slate-700 leading-relaxed">{log.findings}</p>
                    </div>

                    {log.action_taken && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Action Taken:</span>
                        <p className="text-emerald-800 font-medium">{log.action_taken}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Logged by: {log.rep_name}</span>
                    {log.admin_points_awarded && (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        +{log.admin_points_awarded} Pts awarded by Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No quality logs found.</p>
                  <p className="text-xs text-slate-400">Click &quot;Log Quality Check&quot; to submit a new verification or feedback entry.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FAST QUALITY CHECK / RESOLUTION MODAL */}
        {/* ============================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Log Quality Check / Resolution
                    </h3>
                    <p className="text-[11px] text-slate-500">Complete in under 60 seconds</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Audit Category *
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none font-semibold"
                  >
                    <option value="Lodge Verification">Lodge Verification (Caretaker truth-check)</option>
                    <option value="Fresher Feedback">Fresher Feedback (Post-inspection follow-up)</option>
                    <option value="Issue Resolution">Issue Resolution (Water, power, or fee fix)</option>
                    <option value="Caretaker Dispute">Caretaker Dispute (Discrepancy in terms)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target Reference (Lodge or Student Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetReference}
                    onChange={(e) => setTargetReference(e.target.value)}
                    placeholder="e.g. Peace Haven Lodge or Ibrahim Musa"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Findings & Ground Reality *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Describe what you verified: caretaker confirmation, light/water condition, student sentiment, or any issue observed..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Action Taken / Resolution
                  </label>
                  <input
                    type="text"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="e.g. Lodge verified; Caretaker agreed to keep room open until Friday."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("resolved")}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        status === "resolved"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("pending_supervisor")}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        status === "pending_supervisor"
                          ? "bg-amber-100 text-amber-900 border-amber-400"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Pending Supervisor
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Submitting..." : "Save Quality Log"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
