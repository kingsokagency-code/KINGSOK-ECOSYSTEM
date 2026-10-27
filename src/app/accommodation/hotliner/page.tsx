"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getClientLeads,
  createClientLead,
  updateLeadStatus,
  updateClientLead,
  deleteClientLead,
  getWhatsAppBlasts,
  recordWhatsAppBlast,
  deleteWhatsAppBlast,
  getCurrentUser,
  NSUKKA_CAMPUS_AREAS,
  ClientLead,
  WhatsAppBlastLog,
  UserProfile,
} from "@/lib/accommodation-service";
import {
  Radio,
  PlusCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  Users,
  Search,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Send,
  Building,
  Copy,
  Edit2,
  Trash2,
  MapPin,
  Tag,
  Calendar,
  Check,
  AlertCircle,
  Home,
  Headphones,
} from "lucide-react";

export default function HotlinerWorkspace() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [blasts, setBlasts] = useState<WhatsAppBlastLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"leads" | "blasts" | "scripts">("leads");

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterArea, setFilterArea] = useState<string>("all");

  // Lead Modal State (Add or Edit)
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [fresherName, setFresherName] = useState("");
  const [fresherPhone, setFresherPhone] = useState("");
  const [preferredArea, setPreferredArea] = useState("Hilltop");
  const [budgetRange, setBudgetRange] = useState("₦200k - ₦300k");
  const [desiredRoomType, setDesiredRoomType] = useState("Self-contain");
  const [leadStatus, setLeadStatus] = useState<ClientLead["status"]>("new_inquiry");
  const [notes, setNotes] = useState("");

  // Blast Modal State
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [broadcastType, setBroadcastType] = useState<
    "New Vacancies List" | "Fresher Orientation" | "Urgent Flat Offer"
  >("New Vacancies List");
  const [freshersReached, setFreshersReached] = useState(250);

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [leadsList, blastsList, cur] = await Promise.all([
        getClientLeads(),
        getWhatsAppBlasts(),
        getCurrentUser(),
      ]);
      setLeads(leadsList);
      setBlasts(blastsList);
      setCurrentUser(cur);
    }
    load();
  }, []);

  // Modal handlers
  const handleOpenAddLead = () => {
    setEditingLeadId(null);
    setFresherName("");
    setFresherPhone("");
    setPreferredArea("Hilltop");
    setBudgetRange("₦200k - ₦300k");
    setDesiredRoomType("Self-contain");
    setLeadStatus("new_inquiry");
    setNotes("");
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (l: ClientLead) => {
    setEditingLeadId(l.id);
    setFresherName(l.fresher_name);
    setFresherPhone(l.phone);
    setPreferredArea(l.preferred_area);
    setBudgetRange(l.budget_range);
    setDesiredRoomType(l.desired_room_type);
    setLeadStatus(l.status);
    setNotes(l.notes || "");
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fresherName.trim() || !fresherPhone.trim()) {
      alert("Please provide student name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingLeadId) {
        const updated = await updateClientLead(editingLeadId, {
          fresher_name: fresherName.trim(),
          phone: fresherPhone.trim(),
          preferred_area: preferredArea,
          budget_range: budgetRange.trim(),
          desired_room_type: desiredRoomType.trim(),
          status: leadStatus,
          notes: notes.trim() || undefined,
        });

        setLeads((prev) => prev.map((l) => (l.id === editingLeadId ? updated : l)));
        setNotification(`Fresher lead "${updated.fresher_name}" updated successfully!`);
      } else {
        const newLead = await createClientLead({
          fresher_name: fresherName.trim(),
          phone: fresherPhone.trim(),
          preferred_area: preferredArea,
          budget_range: budgetRange.trim(),
          desired_room_type: desiredRoomType.trim(),
          status: leadStatus,
          notes: notes.trim() || undefined,
          hotliner_id: currentUser?.id || "u-chioma",
          hotliner_name: currentUser?.name || "Hotliner",
        });

        setLeads([newLead, ...leads]);
        setNotification(`Fresher lead "${newLead.fresher_name}" recorded successfully!`);
      }

      setIsLeadModalOpen(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead for "${name}"?`)) return;
    try {
      await deleteClientLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setNotification(`Lead for "${name}" deleted.`);
    } catch (err: any) {
      alert("Error deleting lead: " + err.message);
    }
  };

  const handleStatusChange = async (leadId: string, status: ClientLead["status"]) => {
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      setNotification(`Lead status updated to ${status.replace("_", " ")}.`);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleRecordBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please provide the WhatsApp group or community name.");
      return;
    }

    setSubmitting(true);
    try {
      const newBlast = await recordWhatsAppBlast({
        group_name: groupName.trim(),
        broadcast_type: broadcastType,
        freshers_reached_estimate: Number(freshersReached) || 100,
        hotliner_name: currentUser?.name || "Hotliner",
      });

      setBlasts([newBlast, ...blasts]);
      setNotification(`WhatsApp broadcast to "${newBlast.group_name}" logged!`);
      setIsBlastModalOpen(false);
      setGroupName("");
      setFreshersReached(250);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlast = async (id: string, group: string) => {
    if (!confirm(`Delete blast record for "${group}"?`)) return;
    try {
      await deleteWhatsAppBlast(id);
      setBlasts((prev) => prev.filter((b) => b.id !== id));
      setNotification(`Blast record for "${group}" removed.`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setNotification("Script copied to clipboard!");
    setTimeout(() => setCopiedScriptId(null), 3000);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fresher_name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.preferred_area.toLowerCase().includes(search.toLowerCase()) ||
      l.desired_room_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    const matchesArea = filterArea === "all" || l.preferred_area === filterArea;
    return matchesSearch && matchesStatus && matchesArea;
  });

  // Metrics (Live ground truth)
  const totalInquiries = leads.length;
  const newInquiries = leads.filter((l) => l.status === "new_inquiry").length;
  const optionsSent = leads.filter((l) => l.status === "options_sent").length;
  const scheduledInspections = leads.filter((l) => l.status === "inspection_scheduled").length;
  const closedPayments = leads.filter((l) => l.status === "payment_completed").length;
  const totalAudienceReached = blasts.reduce(
    (acc, b) => acc + (b.freshers_reached_estimate || 0),
    0
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
        <AccommodationNav />
        <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mx-auto shadow-xs">
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Hotliner Authentication Required
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in with your staff account to access the Hotliner lead & broadcast hub.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login?portal=staff"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block"
              >
                Sign In as Staff
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentUser.status === "pending_approval" || currentUser.roles.includes("pending")) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
        <AccommodationNav />
        <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-amber-300 p-6 sm:p-8 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto shadow-xs">
              <Radio className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Account Pending Admin Assignment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hello {currentUser.name}, your account is currently pending Admin (Okoye) approval and role assignment.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/accommodation"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block"
              >
                View Status on Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      <AccommodationNav />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast Alert */}
        {notification && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-in fade-in duration-200 border border-emerald-400/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-100 hover:text-white ml-2 text-xs uppercase tracking-wider font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WORKSPACE HEADER */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black uppercase tracking-widest text-emerald-400">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Audience Outreach & Inbound Hotliner
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Fresher Lead Conversion & WhatsApp Broadcast Hub
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Connect incoming students to verified off-campus accommodation with 100% truth. Broadcast curated vacancies to verified WhatsApp groups, qualify inquiries in minutes, and coordinate smooth physical inspections with on-ground Area Controllers.
              </p>
            </div>

            {/* Hotliner Wallet & Action Launcher */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-neutral-900/90 border border-amber-400/40 rounded-2xl p-4 text-center sm:text-right shadow-inner">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Hotliner Rewards
                </div>
                <div className="text-lg font-black text-amber-300 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{currentUser?.total_points || 0} Pts</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    (₦{(currentUser?.cash_value_earned || 0).toLocaleString()})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBlastModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Log Broadcast</span>
                </button>

                <button
                  onClick={handleOpenAddLead}
                  className="flex-1 sm:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 border border-emerald-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Fresher Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE METRICS DISPLAY (GROUND TRUTH) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              Total Inquiries
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {totalInquiries}
            </div>
            <span className="text-[11px] text-neutral-400">All registered leads</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              New Inquiries
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">
              {newInquiries}
            </div>
            <span className="text-[11px] text-neutral-400">Awaiting qualification</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
              Options Sent
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-1">
              {optionsSent}
            </div>
            <span className="text-[11px] text-neutral-400">Lodges shared</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Scheduled Viewings
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {scheduledInspections}
            </div>
            <span className="text-[11px] text-neutral-400">Controller handoff</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Closed Deals
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              {closedPayments}
            </div>
            <span className="text-[11px] text-neutral-400">Payment completed</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Audience Reached
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              ~{totalAudienceReached.toLocaleString()}
            </div>
            <span className="text-[11px] text-neutral-400">Across {blasts.length} blasts</span>
          </div>
        </div>

        {/* OPERATIONAL DIRECTIVE STRIP */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Hotliner 3-Step Execution Model
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Identity Before Temptation &bull; 100% Verified Truth
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                Curated Community Broadcasts
              </span>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Post only verified lodges with confirmed light, water, and exact rent into designated WhatsApp fresher groups. Never inflate features.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-[10px]">
                  2
                </span>
                Rapid 5-Minute Inbound Triage
              </span>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Respond promptly to inquiries. Qualify exact budget, zone preference (Hilltop, Odim, Vet Odim, Odenigwe, Behind Flat...), and room type before sending options.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-[10px]">
                  3
                </span>
                Handoff to Area Controller
              </span>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                Once a student agrees to inspect, connect them immediately to the on-ground Area Controller who unlocks the room and verifies the premises.
              </p>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-neutral-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab("leads")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "leads"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Fresher Inquiries Pipeline</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {filteredLeads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("blasts")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "blasts"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp Community Broadcasts</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
              {blasts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("scripts")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "scripts"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Response Scripts & Etiquette</span>
          </button>
        </div>

        {/* TAB 1: FRESHER INQUIRIES PIPELINE */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student name, phone, area, or room type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-200 outline-none focus:border-emerald-500"
                >
                  <option value="all">All Stages ({leads.length})</option>
                  <option value="new_inquiry">New Inquiry ({newInquiries})</option>
                  <option value="options_sent">Options Sent ({optionsSent})</option>
                  <option value="inspection_scheduled">
                    Inspection Scheduled ({scheduledInspections})
                  </option>
                  <option value="payment_completed">
                    Payment Completed ({closedPayments})
                  </option>
                </select>

                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-200 outline-none focus:border-emerald-500"
                >
                  <option value="all">All Campus Zones</option>
                  {NSUKKA_CAMPUS_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenAddLead}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

            {/* Leads List */}
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 space-y-2">
                <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="font-bold text-sm text-neutral-300">No student leads found</p>
                <p className="text-xs">Adjust your search filter or add a new fresher inquiry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                  const waLink = `https://wa.me/${cleanPhone.startsWith("0") ? "234" + cleanPhone.slice(1) : cleanPhone}`;

                  return (
                    <div
                      key={lead.id}
                      className="bg-neutral-900 border border-neutral-800 hover:border-emerald-800/80 rounded-2xl p-5 transition-all shadow-md space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-white">
                              {lead.fresher_name}
                            </h3>

                            {/* WhatsApp Quick Link */}
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 text-xs font-bold transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Phone Call Link */}
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                            >
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{lead.phone}</span>
                            </a>
                          </div>

                          <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>Zone: <strong className="text-neutral-200">{lead.preferred_area}</strong></span>
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-amber-400" />
                              <span>Budget: <strong className="text-neutral-200">{lead.budget_range}</strong></span>
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Home className="w-3 h-3 text-sky-400" />
                              <span>Type: <strong className="text-neutral-200">{lead.desired_room_type}</strong></span>
                            </span>
                          </div>
                        </div>

                        {/* Stage Selector & Action Buttons */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-start sm:items-end">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 mb-1">
                              Conversion Stage:
                            </span>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead.id, e.target.value as ClientLead["status"])
                              }
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${
                                lead.status === "payment_completed"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                  : lead.status === "inspection_scheduled"
                                  ? "bg-amber-950 text-amber-300 border-amber-700"
                                  : lead.status === "options_sent"
                                  ? "bg-sky-950 text-sky-300 border-sky-700"
                                  : "bg-neutral-800 text-neutral-300 border-neutral-700"
                              }`}
                            >
                              <option value="new_inquiry">New Inquiry</option>
                              <option value="options_sent">Options Sent</option>
                              <option value="inspection_scheduled">Inspection Scheduled</option>
                              <option value="payment_completed">Payment Completed</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleOpenEditLead(lead)}
                            title="Edit Lead"
                            className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.fresher_name)}
                            title="Delete Lead"
                            className="p-2 rounded-xl bg-neutral-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lead Notes */}
                      {lead.notes && (
                        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 text-xs text-neutral-300">
                          <strong className="text-neutral-400 block mb-0.5">Preferences & Notes:</strong>
                          {lead.notes}
                        </div>
                      )}

                      {/* Footer & Meta */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/40">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>Logged: {new Date(lead.created_at).toLocaleDateString()}</span>
                          <span>&bull;</span>
                          <span>Staff: <strong className="text-neutral-300">{lead.hotliner_name}</strong></span>
                        </span>

                        {lead.status === "new_inquiry" && (
                          <button
                            onClick={() => handleStatusChange(lead.id, "options_sent")}
                            className="text-sky-400 hover:text-sky-300 font-bold hover:underline"
                          >
                            Mark Options Sent &rarr;
                          </button>
                        )}
                        {lead.status === "options_sent" && (
                          <button
                            onClick={() => handleStatusChange(lead.id, "inspection_scheduled")}
                            className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                          >
                            Schedule Field Inspection &rarr;
                          </button>
                        )}
                        {lead.status === "inspection_scheduled" && (
                          <button
                            onClick={() => handleStatusChange(lead.id, "payment_completed")}
                            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                          >
                            Confirm Payment & Close Deal &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHATSAPP COMMUNITY BROADCASTS */}
        {activeTab === "blasts" && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  WhatsApp Community Broadcasts ({blasts.length})
                </h3>
                <p className="text-xs text-neutral-400">
                  Track all lodge list announcements and fresher orientation broadcasts.
                </p>
              </div>

              <button
                onClick={() => setIsBlastModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log New Broadcast</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {blasts.map((blast) => (
                <div
                  key={blast.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        <MessageCircle className="w-3 h-3" />
                        <span>{blast.broadcast_type}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {blast.group_name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDeleteBlast(blast.id, blast.group_name)}
                      title="Delete Broadcast Record"
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80 pt-3">
                    <span className="font-mono text-emerald-400 font-bold">
                      ~{blast.freshers_reached_estimate} Freshers Reached
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(blast.created_at).toLocaleDateString()} &bull; {blast.hotliner_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RESPONSE SCRIPTS & ETIQUETTE */}
        {activeTab === "scripts" && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <h3 className="text-base font-extrabold text-white">
                Official Hotliner WhatsApp Scripts
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                Use these standardized, high-integrity response templates when communicating with prospective students and parents on WhatsApp. Click to copy directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Script 1 */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Step 1: Inbound Greeting
                    </span>
                    <span className="text-[10px] text-neutral-500">First Contact</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Budget & Location Qualification
                  </h4>
                  <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 leading-relaxed font-sans">
                    &quot;Hello! Warm welcome to the campus community. This is {currentUser?.name || "Hotliner"} from KINGSOK Accommodation. We help students secure verified, safe, and transparent lodge accommodations with zero hidden charges.
                    <br /><br />
                    To recommend the best available rooms for you:
                    <br />1. What is your budget range (e.g. ₦200k - ₦300k)?
                    <br />2. Which campus zone do you prefer (Hilltop, Odim, Vet Odim, Odenigwe, Behind Flat...)?
                    <br />3. What room type are you looking for (Self-contain or Single)?&quot;
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      "script-1",
                      `Hello! Warm welcome to the campus community. This is ${currentUser?.name || "Hotliner"} from KINGSOK Accommodation. We help students secure verified, safe, and transparent lodge accommodations with zero hidden charges.\n\nTo recommend the best available rooms for you:\n1. What is your budget range (e.g. ₦200k - ₦300k)?\n2. Which campus zone do you prefer (Hilltop, Odim, Vet Odim, Odenigwe, Behind Flat...)?\n3. What room type are you looking for (Self-contain or Single)?`
                    )
                  }
                  className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  {copiedScriptId === "script-1" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Script 2 */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                      Step 2: Recommendations
                    </span>
                    <span className="text-[10px] text-neutral-500">Truth Presentation</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Verified Lodge Recommendation
                  </h4>
                  <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 leading-relaxed font-sans">
                    &quot;Here is a verified room matching your budget right now:
                    <br /><br />
                    • Lodge: Peace Haven Lodge
                    <br />• Location: Hilltop (7 mins walk to gate)
                    <br />• Room Type: Modern Self-contain
                    <br />• Annual Rent: ₦240,000 (Total package verified)
                    <br />• Ground Truth: Water is constant via solar borehole; light is stable on the university line; fence and gate lock at 10 PM.
                    <br /><br />
                    Would you like our on-ground Area Controller to take you for a physical inspection?&quot;
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      "script-2",
                      `Here is a verified room matching your budget right now:\n\n• Lodge: Peace Haven Lodge\n• Location: Hilltop (7 mins walk to gate)\n• Room Type: Modern Self-contain\n• Annual Rent: ₦240,000 (Total package verified)\n• Ground Truth: Water is constant via solar borehole; light is stable on the university line; fence and gate lock at 10 PM.\n\nWould you like our on-ground Area Controller to take you for a physical inspection?`
                    )
                  }
                  className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  {copiedScriptId === "script-2" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Script 3 */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      Step 3: Ground Handoff
                    </span>
                    <span className="text-[10px] text-neutral-500">Inspection Setup</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Area Controller Inspection Handoff
                  </h4>
                  <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 leading-relaxed font-sans">
                    &quot;Great! Our on-ground Area Controller is ready for your inspection.
                    <br /><br />
                    They will meet you at the campus gate, take you directly to the lodge, and inspect the room, water tap, and light points with you.
                    <br /><br />
                    Please send them a message or call them when you are heading out so they can be waiting for you.&quot;
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      "script-3",
                      `Great! Our on-ground Area Controller is ready for your inspection.\n\nThey will meet you at the campus gate, take you directly to the lodge, and inspect the room, water tap, and light points with you.\n\nPlease send them a message or call them when you are heading out so they can be waiting for you.`
                    )
                  }
                  className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  {copiedScriptId === "script-3" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT FRESHER LEAD */}
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg">
                    {editingLeadId ? "Edit Fresher Lead" : "New Fresher Inquiry"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Record prospective student details and accommodation criteria.
                  </p>
                </div>
                <button
                  onClick={() => setIsLeadModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Student / Fresher Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibrahim Musa"
                    value={fresherName}
                    onChange={(e) => setFresherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08091123344 or +234 809 112 3344"
                    value={fresherPhone}
                    onChange={(e) => setFresherPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Preferred Area
                    </label>
                    <select
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    >
                      {NSUKKA_CAMPUS_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₦250k - ₦300k"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Desired Room Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Self-contain, Single room"
                      value={desiredRoomType}
                      onChange={(e) => setDesiredRoomType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">
                      Inquiry Stage
                    </label>
                    <select
                      value={leadStatus}
                      onChange={(e) => setLeadStatus(e.target.value as ClientLead["status"])}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    >
                      <option value="new_inquiry">New Inquiry</option>
                      <option value="options_sent">Options Sent</option>
                      <option value="inspection_scheduled">Inspection Scheduled</option>
                      <option value="payment_completed">Payment Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Special Preferences / Specific Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Needs constant solar light, prefers quiet environment, arriving this weekend with guardian..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2.5 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-4 py-2.5 font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    {submitting ? "Saving..." : editingLeadId ? "Update Lead" : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LOG WHATSAPP BROADCAST */}
        {isBlastModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg">
                    Log WhatsApp Community Broadcast
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Record your vacancies blast to track audience reach.
                  </p>
                </div>
                <button
                  onClick={() => setIsBlastModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordBlast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Group / Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNN 2026/2027 Freshers Main"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Broadcast Type
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500"
                  >
                    <option value="New Vacancies List">New Vacancies List</option>
                    <option value="Fresher Orientation">Fresher Orientation Advice</option>
                    <option value="Urgent Flat Offer">Urgent Flat Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Estimated Freshers Reached
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={freshersReached}
                    onChange={(e) => setFreshersReached(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2.5 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsBlastModalOpen(false)}
                    className="px-4 py-2.5 font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    {submitting ? "Logging..." : "Log Broadcast"}
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
