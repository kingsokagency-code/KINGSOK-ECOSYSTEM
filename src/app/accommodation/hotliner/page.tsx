"use client";

import React, { useEffect, useState } from "react";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getClientLeads,
  createClientLead,
  updateLeadStatus,
  getWhatsAppBlasts,
  recordWhatsAppBlast,
  getCurrentUser,
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
} from "lucide-react";

export default function HotlinerWorkspace() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [blasts, setBlasts] = useState<WhatsAppBlastLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Lead Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [fresherName, setFresherName] = useState("");
  const [fresherPhone, setFresherPhone] = useState("");
  const [preferredArea, setPreferredArea] = useState("Hilltop Phase 1");
  const [budgetRange, setBudgetRange] = useState("₦200k - ₦300k");
  const [desiredRoomType, setDesiredRoomType] = useState("Self-contain");
  const [notes, setNotes] = useState("");

  // Blast Modal State
  const [isBlastModalOpen, setIsBlastModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [broadcastType, setBroadcastType] = useState<'New Vacancies List' | 'Fresher Orientation' | 'Urgent Flat Offer'>('New Vacancies List');
  const [freshersReached, setFreshersReached] = useState(250);

  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newLead = await createClientLead({
        fresher_name: fresherName.trim(),
        phone: fresherPhone.trim(),
        preferred_area: preferredArea,
        budget_range: budgetRange.trim(),
        desired_room_type: desiredRoomType.trim(),
        status: "new_inquiry",
        notes: notes.trim() || undefined,
        hotliner_id: currentUser?.id || "u-chioma",
        hotliner_name: currentUser?.name || "Hotliner",
      });

      setLeads([newLead, ...leads]);
      setNotification(`Fresher lead "${newLead.fresher_name}" recorded successfully!`);
      setIsLeadModalOpen(false);

      // Reset
      setFresherName("");
      setFresherPhone("");
      setNotes("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newBlast = await recordWhatsAppBlast({
        group_name: groupName.trim(),
        broadcast_type: broadcastType,
        freshers_reached_estimate: Number(freshersReached),
        hotliner_name: currentUser?.name || "Hotliner",
      });

      setBlasts([newBlast, ...blasts]);
      setNotification(`WhatsApp Broadcast to "${newBlast.group_name}" logged!`);
      setIsBlastModalOpen(false);
      setGroupName("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId: string, status: ClientLead["status"]) => {
    const updated = await updateLeadStatus(leadId, status);
    setLeads(leads.map((l) => (l.id === leadId ? updated : l)));
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.fresher_name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.preferred_area.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AccommodationNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP HOTLINER IDENTITY & REWARDS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 flex-shrink-0">
              <Radio className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audience Engagement & Publicity</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Hotliner & Blast Manager Workspace
              </h1>
              <p className="text-xs text-slate-500">
                Logged in as: <strong className="text-slate-800">{currentUser?.name}</strong> &bull; Direct Fresher Contact & Community Broadcasts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] font-bold uppercase text-slate-500">My Rewards</div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 justify-end">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{currentUser?.total_points || 0} Pts</span>
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  (₦{(currentUser?.cash_value_earned || 0).toLocaleString()})
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBlastModalOpen(true)}
              className="py-2.5 px-3.5 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log WhatsApp Blast</span>
            </button>

            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="py-2.5 px-4 bg-kingsok-700 hover:bg-kingsok-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Fresher Inquiry</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION */}
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* MISSION DIRECTIVE */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-800 pb-3">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-blue-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Hotliner Operational Directive</span>
            </h2>
            <span className="text-[11px] text-blue-300 font-mono">
              Target: Reach 5,000 Freshers &bull; Convert to 500 Placements
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
              <span className="font-bold text-white block">1. Broadcast Curated Vacancies</span>
              <span className="text-blue-200/80">
                Post empty lodge updates in designated WhatsApp groups. Three appointed reps manage group postings.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
              <span className="font-bold text-white block">2. Inbound Fresher Qualification</span>
              <span className="text-blue-200/80">
                Capture their exact budget, desired location, and moving date within 5 minutes of inquiry.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80 space-y-1">
              <span className="font-bold text-white block">3. Handoff to Area Controller</span>
              <span className="text-blue-200/80">
                Once a student is ready to view, immediately assign them to the Area Controller on ground for physical inspection.
              </span>
            </div>
          </div>
        </div>

        {/* FRESHER LEADS PIPELINE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Fresher Client Inquiries ({filteredLeads.length})
              </h3>
              <p className="text-xs text-slate-500">
                Track student prospects from first contact to inspection and payment.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search fresher name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none w-52"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none"
              >
                <option value="all">All Stages</option>
                <option value="new_inquiry">New Inquiry</option>
                <option value="options_sent">Options Sent</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="payment_completed">Payment Completed</option>
              </select>
            </div>
          </div>

          {/* LEADS LIST */}
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {lead.fresher_name}
                      </h4>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp ({lead.phone})</span>
                      </a>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Area: <strong className="text-slate-700">{lead.preferred_area}</strong></span>
                      <span>&bull;</span>
                      <span>Budget: <strong className="text-slate-700">{lead.budget_range}</strong></span>
                      <span>&bull;</span>
                      <span>Type: <strong className="text-slate-700">{lead.desired_room_type}</strong></span>
                    </div>
                  </div>

                  {/* Stage Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">Stage:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none ${
                        lead.status === "payment_completed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : lead.status === "inspection_scheduled"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : lead.status === "options_sent"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                    >
                      <option value="new_inquiry">New Inquiry</option>
                      <option value="options_sent">Options Sent</option>
                      <option value="inspection_scheduled">Inspection Scheduled</option>
                      <option value="payment_completed">Payment Completed (Closed)</option>
                    </select>
                  </div>
                </div>

                {lead.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                    <strong>Notes:</strong> {lead.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WHATSAPP BLASTS FEED */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Recent WhatsApp Community Blasts
              </h3>
              <p className="text-xs text-slate-500">
                Audience engagement records across freshers and accommodation channels.
              </p>
            </div>

            <button
              onClick={() => setIsBlastModalOpen(true)}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              + Log New Blast
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blasts.map((blast) => (
              <div
                key={blast.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{blast.group_name}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(blast.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-600 flex items-center justify-between">
                  <span>Type: <strong>{blast.broadcast_type}</strong></span>
                  <span className="font-mono text-emerald-700 font-bold">
                    ~{blast.freshers_reached_estimate} Reached
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL: ADD FRESHER LEAD */}
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">
                  New Fresher Inquiry
                </h3>
                <button onClick={() => setIsLeadModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student / Fresher Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibrahim Musa"
                    value={fresherName}
                    onChange={(e) => setFresherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +234 809 112 3344"
                    value={fresherPhone}
                    onChange={(e) => setFresherPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Preferred Area
                    </label>
                    <select
                      value={preferredArea}
                      onChange={(e) => setPreferredArea(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Hilltop Phase 1">Hilltop Phase 1</option>
                      <option value="Hilltop Phase 2">Hilltop Phase 2</option>
                      <option value="Odim Gate Area">Odim Gate Area</option>
                      <option value="Ofulonu Zone">Ofulonu Zone</option>
                      <option value="Behind Flat">Behind Flat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₦250k - ₦300k"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Desired Room Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Self-contain, Single room"
                    value={desiredRoomType}
                    onChange={(e) => setDesiredRoomType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Special Preferences / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Prefers quiet lodge, needs generator for light..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLeadModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {submitting ? "Saving..." : "Save Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LOG WHATSAPP BLAST */}
        {isBlastModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Log WhatsApp Broadcast Blast
                </h3>
                <button onClick={() => setIsBlastModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleRecordBlast} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Group / Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNN 2026/2027 Freshers Main"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Broadcast Type
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="New Vacancies List">New Vacancies List</option>
                    <option value="Fresher Orientation">Fresher Orientation Advice</option>
                    <option value="Urgent Flat Offer">Urgent Flat Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimated Freshers Reached
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={freshersReached}
                    onChange={(e) => setFreshersReached(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBlastModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {submitting ? "Logging..." : "Log Blast"}
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
