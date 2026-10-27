"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getRegisteredClients,
  createRegisteredClient,
  updateRegisteredClient,
  deleteRegisteredClient,
  getCustomerRepLogs,
  createCustomerRepLog,
  updateCustomerRepLogStatus,
  deleteCustomerRepLog,
  getCurrentUser,
  RegisteredClientRecord,
  CustomerRepLog,
  KingsokSector,
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
  Building,
  UserCheck,
  Clock,
  X,
  Send,
  MessageSquare,
  ThumbsUp,
  AlertOctagon,
  Users,
  Edit2,
  Trash2,
  CreditCard,
  MessageCircle,
  Home,
  Building2,
  KeyRound,
  UtensilsCrossed,
  Star,
  ArrowRight,
} from "lucide-react";

export default function CustomerRepWorkspace() {
  const [clients, setClients] = useState<RegisteredClientRecord[]>([]);
  const [repLogs, setRepLogs] = useState<CustomerRepLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"clients" | "feedback">("clients");
  const [sectorFilter, setSectorFilter] = useState<"all" | KingsokSector>("all");
  const [search, setSearch] = useState("");
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientSector, setClientSector] = useState<KingsokSector>("Accommodation");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCategory, setClientCategory] = useState("100L Fresher");
  const [clientDept, setClientDept] = useState("");
  const [clientServiceAcquired, setClientServiceAcquired] = useState("");
  const [clientArea, setClientArea] = useState("Hilltop Phase 1");
  const [clientAmountPaid, setClientAmountPaid] = useState("");
  const [clientPaymentStatus, setClientPaymentStatus] = useState<RegisteredClientRecord["payment_status"]>("paid_in_full");
  const [clientAssignedStaff, setClientAssignedStaff] = useState("");
  const [clientEmergencyContact, setClientEmergencyContact] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSector, setFeedbackSector] = useState<KingsokSector>("Accommodation");
  const [feedbackCategory, setFeedbackCategory] = useState<CustomerRepLog["category"]>("Client Feedback");
  const [feedbackTargetRef, setFeedbackTargetRef] = useState("");
  const [feedbackFindings, setFeedbackFindings] = useState("");
  const [feedbackActionTaken, setFeedbackActionTaken] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState<"resolved" | "pending_supervisor">("resolved");

  useEffect(() => {
    async function load() {
      const [cList, rList, cur] = await Promise.all([
        getRegisteredClients(),
        getCustomerRepLogs(),
        getCurrentUser(),
      ]);
      setClients(cList);
      setRepLogs(rList);
      setCurrentUser(cur);
    }
    load();
  }, []);

  // Open Client Modal for Add
  const handleOpenAddClient = (sector: KingsokSector = "Accommodation") => {
    setEditingClientId(null);
    setClientSector(sector);
    setClientName("");
    setClientPhone("");
    setClientWhatsapp("");
    setClientEmail("");
    setClientCategory(sector === "Accommodation" ? "100L Fresher" : sector === "Properties" ? "Property Buyer" : sector === "Rentals" ? "Equipment Rental" : "Meal Plan Subscriber");
    setClientDept("");
    setClientServiceAcquired("");
    setClientArea(sector === "Accommodation" ? "Hilltop Phase 1" : "University Vicinity");
    setClientAmountPaid("");
    setClientPaymentStatus("paid_in_full");
    setClientAssignedStaff(currentUser?.name || "Customer Rep");
    setClientEmergencyContact("");
    setClientNotes("");
    setIsClientModalOpen(true);
  };

  // Open Client Modal for Edit
  const handleOpenEditClient = (c: RegisteredClientRecord) => {
    setEditingClientId(c.id);
    setClientSector(c.sector);
    setClientName(c.client_name);
    setClientPhone(c.phone);
    setClientWhatsapp(c.whatsapp_phone || "");
    setClientEmail(c.email || "");
    setClientCategory(c.client_category);
    setClientDept(c.department_or_occupation || "");
    setClientServiceAcquired(c.service_or_lodge_acquired);
    setClientArea(c.area_or_location);
    setClientAmountPaid(c.amount_paid || "");
    setClientPaymentStatus(c.payment_status);
    setClientAssignedStaff(c.assigned_staff_name || "");
    setClientEmergencyContact(c.emergency_or_parent_contact || "");
    setClientNotes(c.notes || "");
    setIsClientModalOpen(true);
  };

  // Save Client (Add or Edit)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !clientServiceAcquired.trim()) {
      alert("Please provide the client name, phone number, and service/lodge acquired.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingClientId) {
        const updated = await updateRegisteredClient(editingClientId, {
          sector: clientSector,
          client_name: clientName.trim(),
          phone: clientPhone.trim(),
          whatsapp_phone: clientWhatsapp.trim() || undefined,
          email: clientEmail.trim() || undefined,
          client_category: clientCategory.trim(),
          department_or_occupation: clientDept.trim() || undefined,
          service_or_lodge_acquired: clientServiceAcquired.trim(),
          area_or_location: clientArea.trim() || "University Vicinity",
          amount_paid: clientAmountPaid.trim() || undefined,
          payment_status: clientPaymentStatus,
          assigned_staff_name: clientAssignedStaff.trim() || undefined,
          emergency_or_parent_contact: clientEmergencyContact.trim() || undefined,
          notes: clientNotes.trim() || undefined,
        });

        setClients((prev) => prev.map((c) => (c.id === editingClientId ? updated : c)));
        setNotification(`Client profile for "${updated.client_name}" updated!`);
      } else {
        const newClient = await createRegisteredClient({
          sector: clientSector,
          client_name: clientName.trim(),
          phone: clientPhone.trim(),
          whatsapp_phone: clientWhatsapp.trim() || undefined,
          email: clientEmail.trim() || undefined,
          client_category: clientCategory.trim(),
          department_or_occupation: clientDept.trim() || undefined,
          service_or_lodge_acquired: clientServiceAcquired.trim(),
          area_or_location: clientArea.trim() || "University Vicinity",
          amount_paid: clientAmountPaid.trim() || undefined,
          payment_status: clientPaymentStatus,
          assigned_staff_name: clientAssignedStaff.trim() || undefined,
          emergency_or_parent_contact: clientEmergencyContact.trim() || undefined,
          notes: clientNotes.trim() || undefined,
          registered_by_id: currentUser?.id || "u-kalu",
          registered_by_name: currentUser?.name || "Kalu Eze",
        });

        setClients([newClient, ...clients]);
        setNotification(`Client "${newClient.client_name}" registered across ${newClient.sector} sector!`);
      }

      setIsClientModalOpen(false);
      setEditingClientId(null);
    } catch (err: any) {
      alert("Error saving client: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove client "${name}" from the active registry?`)) return;
    try {
      await deleteRegisteredClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setNotification(`Client "${name}" removed from registry.`);
    } catch (err: any) {
      alert("Error deleting client: " + err.message);
    }
  };

  // Open Feedback Modal pre-filled for a specific client
  const handleOpenFeedbackForClient = (c: RegisteredClientRecord) => {
    setFeedbackSector(c.sector);
    setFeedbackCategory("Client Feedback");
    setFeedbackTargetRef(`${c.client_name} (${c.service_or_lodge_acquired})`);
    setFeedbackFindings(`Called ${c.client_name} (${c.phone}). Followed up on service satisfaction regarding ${c.service_or_lodge_acquired}.`);
    setFeedbackActionTaken("Recorded direct client feedback and confirmed receipt of service.");
    setFeedbackRating(5);
    setFeedbackStatus("resolved");
    setIsFeedbackModalOpen(true);
  };

  // Save Feedback Log
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTargetRef.trim() || !feedbackFindings.trim()) {
      alert("Please enter the client reference and feedback findings.");
      return;
    }

    setSubmitting(true);
    try {
      const newLog = await createCustomerRepLog({
        sector: feedbackSector,
        category: feedbackCategory,
        target_reference: feedbackTargetRef.trim(),
        findings: feedbackFindings.trim(),
        action_taken: feedbackActionTaken.trim() || "Recorded in client feedback log.",
        satisfaction_rating: feedbackRating,
        status: feedbackStatus,
        rep_name: currentUser?.name || "Customer Rep",
      });

      setRepLogs([newLog, ...repLogs]);
      setNotification(`Feedback record for "${newLog.target_reference}" logged successfully!`);
      setIsFeedbackModalOpen(false);
      setFeedbackTargetRef("");
      setFeedbackFindings("");
      setFeedbackActionTaken("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle feedback resolution status
  const handleToggleLogStatus = async (log: CustomerRepLog) => {
    const nextStatus = log.status === "resolved" ? "pending_supervisor" : "resolved";
    try {
      const updated = await updateCustomerRepLogStatus(log.id, nextStatus);
      setRepLogs((prev) => prev.map((l) => (l.id === log.id ? updated : l)));
      setNotification(`Status for "${log.target_reference}" set to ${nextStatus.replace("_", " ")}.`);
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  // Delete Feedback Log
  const handleDeleteLog = async (id: string, refName: string) => {
    if (!confirm(`Delete feedback entry for "${refName}"?`)) return;
    try {
      await deleteCustomerRepLog(id);
      setRepLogs((prev) => prev.filter((l) => l.id !== id));
      setNotification(`Feedback entry removed.`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Filtered Clients
  const filteredClients = clients.filter((c) => {
    const matchSector = sectorFilter === "all" || c.sector === sectorFilter;
    const matchSearch =
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.whatsapp_phone && c.whatsapp_phone.includes(search)) ||
      c.service_or_lodge_acquired.toLowerCase().includes(search.toLowerCase()) ||
      c.area_or_location.toLowerCase().includes(search.toLowerCase()) ||
      c.client_category.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchSearch;
  });

  // Filtered Feedback Logs
  const filteredLogs = repLogs.filter((l) => {
    const matchSector = sectorFilter === "all" || !l.sector || l.sector === sectorFilter;
    const matchCat = feedbackCategoryFilter === "all" || l.category === feedbackCategoryFilter;
    const matchSearch =
      l.target_reference.toLowerCase().includes(search.toLowerCase()) ||
      l.findings.toLowerCase().includes(search.toLowerCase()) ||
      l.rep_name.toLowerCase().includes(search.toLowerCase());
    return matchSector && matchCat && matchSearch;
  });

  // Metrics
  const accClientsCount = clients.filter((c) => c.sector === "Accommodation").length;
  const crossSectorClientsCount = clients.filter((c) => c.sector !== "Accommodation").length;
  const pendingIssuesCount = repLogs.filter((l) => l.status === "pending_supervisor").length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
        <AccommodationNav />
        <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto shadow-xs">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Customer Rep Authentication Required
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in with your staff account to access the Customer Rep cross-sector desk.
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
              <Headphones className="w-7 h-7" />
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
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-black uppercase tracking-widest text-amber-400">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                Cross-Sector Customer Rep Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Client Registration & Direct Feedback Hub
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Customer Reps serve as the unifying client advocate across all KINGSOK initiatives: registering complete client profiles, verifying fulfillment quality, and collecting direct client feedback with uncompromising truth.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleOpenAddClient("Accommodation")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register New Client</span>
              </button>

              <button
                onClick={() => {
                  setFeedbackSector("Accommodation");
                  setFeedbackCategory("Client Feedback");
                  setFeedbackTargetRef("");
                  setFeedbackFindings("");
                  setFeedbackActionTaken("");
                  setFeedbackRating(5);
                  setFeedbackStatus("resolved");
                  setIsFeedbackModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs border border-neutral-700 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Log Client Feedback</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium">Logged in Customer Rep:</span>
              <strong className="text-white font-bold">{currentUser?.name || "Kalu Eze"}</strong>
              <span className="text-neutral-400 font-mono">({currentUser?.phone || "+234 705 333 4455"})</span>
            </div>

            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-neutral-400">Earned Rewards:</span>
              <span className="font-extrabold text-white">{currentUser?.total_points || 0} Pts</span>
              <span className="text-amber-400 font-mono font-bold">
                (₦{((currentUser?.total_points || 0) * 1000).toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* KEY GROUND-TRUTH METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Total Clients</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{clients.length}</div>
            <p className="text-[11px] text-neutral-400">Full profiles registered</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Accommodation Clients</span>
              <Home className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{accClientsCount}</div>
            <p className="text-[11px] text-neutral-400">Freshers & transition students</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Cross-Sector Clients</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{crossSectorClientsCount}</div>
            <p className="text-[11px] text-neutral-400">Properties, Rentals, & Food</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Pending Issues</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{pendingIssuesCount}</div>
            <p className="text-[11px] text-neutral-400">Awaiting supervisor action</p>
          </div>
        </div>

        {/* WORKSPACE TABS & SECTOR FILTER */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("clients")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "clients"
                    ? "bg-amber-400 text-neutral-950 font-black shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Client Registry & Profiles ({clients.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "feedback"
                    ? "bg-amber-400 text-neutral-950 font-black shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Client Direct Feedback & Quality ({repLogs.length})</span>
              </button>
            </div>

            {/* Sector Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(["all", "Accommodation", "Properties", "Rentals", "Food"] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectorFilter(sec)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    sectorFilter === sec
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                  }`}
                >
                  {sec === "all" ? "All Sectors" : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "clients"
                  ? "Search client name, phone, service/lodge, area, or category..."
                  : "Search feedback reference, findings, or representative..."
              }
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CLIENT REGISTRY (CROSS-SECTOR) */}
        {/* ============================================================== */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.map((client) => {
                const isAccommodation = client.sector === "Accommodation";
                const isPaid = client.payment_status === "paid_in_full";

                return (
                  <div
                    key={client.id}
                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-white text-base">
                              {client.client_name}
                            </h3>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                client.sector === "Accommodation"
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                                  : client.sector === "Properties"
                                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                                  : client.sector === "Rentals"
                                  ? "bg-blue-950 text-blue-300 border-blue-500/40"
                                  : "bg-purple-950 text-purple-300 border-purple-500/40"
                              }`}
                            >
                              {client.sector}
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-neutral-400 block mt-0.5">
                            {client.client_category} {client.department_or_occupation && `&bull; ${client.department_or_occupation}`}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                            isPaid
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : client.payment_status === "part_payment"
                              ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                              : "bg-neutral-800 text-neutral-300 border-neutral-700"
                          }`}
                        >
                          {client.payment_status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Contact & Service Details */}
                      <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Service Acquired:</span>
                          <span className="font-extrabold text-white">{client.service_or_lodge_acquired}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Territory / Location:</span>
                          <span className="font-medium text-neutral-200">{client.area_or_location}</span>
                        </div>

                        {client.amount_paid && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Amount / Tariff:</span>
                            <span className="font-mono font-bold text-emerald-400">{client.amount_paid}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${client.phone}`}
                              className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </a>

                            {client.whatsapp_phone && (
                              <a
                                href={`https://wa.me/${client.whatsapp_phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1 ml-2"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-500" />
                                WhatsApp
                              </a>
                            )}
                          </div>

                          {client.assigned_staff_name && (
                            <span className="text-[11px] text-neutral-400">
                              Assigned Staff: <strong className="text-neutral-200">{client.assigned_staff_name}</strong>
                            </span>
                          )}
                        </div>

                        {client.emergency_or_parent_contact && (
                          <div className="pt-1 text-[11px] text-neutral-400">
                            Parent/Emergency: <span className="text-neutral-300 font-medium">{client.emergency_or_parent_contact}</span>
                          </div>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-xs text-neutral-400 italic bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/60">
                          &ldquo;{client.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-800">
                      <span>Registered by: {client.registered_by_name}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenFeedbackForClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Log Feedback</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClient(client.id, client.client_name)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClients.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-2">
                  <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No clients registered matching this sector/search.</p>
                  <p className="text-xs text-neutral-500">Click &quot;Register New Client&quot; above to capture client details across any sector.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CLIENT FEEDBACK & QUALITY LOG */}
        {/* ============================================================== */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
                Direct Client Feedback & Oversight Stream
              </span>
              <span>Accountability feed visible to Admin & Supervisors</span>
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          log.category === "Client Feedback"
                            ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                            : log.category === "Fresher Feedback"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                            : log.category === "Caretaker Dispute"
                            ? "bg-rose-950 text-rose-400 border-rose-500/40"
                            : "bg-blue-950 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        {log.category}
                      </span>
                      {log.sector && (
                        <span className="text-[10px] font-bold text-neutral-400 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                          {log.sector}
                        </span>
                      )}
                      <h4 className="font-extrabold text-white text-sm">
                        {log.target_reference}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.satisfaction_rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{log.satisfaction_rating} / 5</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleToggleLogStatus(log)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          log.status === "resolved"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/40 hover:bg-amber-400/20"
                        }`}
                      >
                        {log.status === "resolved" ? "Resolved" : "Pending Supervisor"}
                      </button>

                      <span className="text-[11px] text-neutral-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-400 block">Ground Findings / Client Statement:</span>
                      <p className="text-neutral-200 leading-relaxed mt-0.5">{log.findings}</p>
                    </div>

                    {log.action_taken && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">Action Taken:</span>
                        <p className="text-emerald-400 font-medium mt-0.5">{log.action_taken}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                    <span>Logged by: {log.rep_name}</span>

                    <div className="flex items-center gap-2">
                      {log.admin_points_awarded && (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          +{log.admin_points_awarded} Pts awarded by Admin
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteLog(log.id, log.target_reference)}
                        className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete Feedback"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-2">
                  <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No client feedback records found.</p>
                  <p className="text-xs text-neutral-500">Click &quot;Log Client Feedback&quot; to submit a direct client experience log.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: REGISTER NEW CLIENT (CROSS-SECTOR) */}
        {/* ============================================================== */}
        {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      {editingClientId ? "Edit Client Profile" : "Register Client (Cross-Sector)"}
                    </h3>
                    <p className="text-[11px] text-neutral-400">Capture full client information across all KINGSOK sectors</p>
                  </div>
                </div>
                <button onClick={() => setIsClientModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
                {/* Sector Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    KINGSOK Sector *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["Accommodation", "Properties", "Rentals", "Food"] as KingsokSector[]).map((sec) => (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => setClientSector(sec)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          clientSector === sec
                            ? "bg-amber-400 text-neutral-950 border-amber-400 font-black shadow-xs"
                            : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Full Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Blessing Udoh"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+234 814..."
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      WhatsApp Phone
                    </label>
                    <input
                      type="text"
                      value={clientWhatsapp}
                      onChange={(e) => setClientWhatsapp(e.target.value)}
                      placeholder="+234 814..."
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@uni.edu.ng"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Client Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientCategory}
                      onChange={(e) => setClientCategory(e.target.value)}
                      placeholder="e.g. 100L Fresher, Property Buyer..."
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Department / Occupation
                    </label>
                    <input
                      type="text"
                      value={clientDept}
                      onChange={(e) => setClientDept(e.target.value)}
                      placeholder="e.g. Pharmacy / Civil Engineer"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Service / Lodge / Asset Acquired *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientServiceAcquired}
                    onChange={(e) => setClientServiceAcquired(e.target.value)}
                    placeholder="e.g. Peace Haven Lodge - Room 8, Plot 4B, or 500-Chair Rental"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Location / Zone</label>
                    <input
                      type="text"
                      value={clientArea}
                      onChange={(e) => setClientArea(e.target.value)}
                      placeholder="Hilltop Phase 1"
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Amount Paid / Fee</label>
                    <input
                      type="text"
                      value={clientAmountPaid}
                      onChange={(e) => setClientAmountPaid(e.target.value)}
                      placeholder="₦280,000"
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Payment Status</label>
                    <select
                      value={clientPaymentStatus}
                      onChange={(e) => setClientPaymentStatus(e.target.value as any)}
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-semibold"
                    >
                      <option value="paid_in_full">Paid in Full</option>
                      <option value="part_payment">Part Payment</option>
                      <option value="inspection_only">Inspection Only</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Assigned Field Agent / Staff
                    </label>
                    <input
                      type="text"
                      value={clientAssignedStaff}
                      onChange={(e) => setClientAssignedStaff(e.target.value)}
                      placeholder="e.g. Emeka Obi (Controller)"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Parent / Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={clientEmergencyContact}
                      onChange={(e) => setClientEmergencyContact(e.target.value)}
                      placeholder="Dr. Udoh - +234 802..."
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Special Notes
                  </label>
                  <textarea
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Details about client onboarding, special preferences, or receipts issued..."
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Saving..." : editingClientId ? "Update Client Profile" : "Register Client"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: LOG CLIENT FEEDBACK */}
        {/* ============================================================== */}
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      Log Client Direct Feedback
                    </h3>
                    <p className="text-[11px] text-neutral-400">Capture direct client sentiment and service experience</p>
                  </div>
                </div>
                <button onClick={() => setIsFeedbackModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Sector *
                    </label>
                    <select
                      value={feedbackSector}
                      onChange={(e) => setFeedbackSector(e.target.value as KingsokSector)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold"
                    >
                      <option value="Accommodation">Accommodation</option>
                      <option value="Properties">Properties</option>
                      <option value="Rentals">Rentals</option>
                      <option value="Food">Food & Catering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Feedback Category *
                    </label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold"
                    >
                      <option value="Client Feedback">Direct Client Feedback</option>
                      <option value="Fresher Feedback">Fresher Post-Inspection</option>
                      <option value="Issue Resolution">Issue / Service Resolution</option>
                      <option value="Caretaker Dispute">Caretaker / Landlord Dispute</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Client & Service Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackTargetRef}
                    onChange={(e) => setFeedbackTargetRef(e.target.value)}
                    placeholder="e.g. Blessing Udoh (Peace Haven Lodge)"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold focus:border-amber-400 outline-none"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Client Satisfaction Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setFeedbackRating(starVal)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          feedbackRating >= starVal
                            ? "bg-amber-400/20 border-amber-400 text-amber-400 scale-105"
                            : "bg-neutral-950 border-neutral-800 text-neutral-600"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${feedbackRating >= starVal ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-400 ml-2">
                      {feedbackRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Client Ground Statement & Feedback *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedbackFindings}
                    onChange={(e) => setFeedbackFindings(e.target.value)}
                    placeholder="Describe direct client remarks on service quality, timeliness, fee transparency, and satisfaction..."
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Action Taken / Follow-up Resolution
                  </label>
                  <input
                    type="text"
                    value={feedbackActionTaken}
                    onChange={(e) => setFeedbackActionTaken(e.target.value)}
                    placeholder="e.g. Confirmed satisfaction; forwarded maintenance note to Area Controller."
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Resolution Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackStatus("resolved")}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        feedbackStatus === "resolved"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Resolved & Satisfied
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackStatus("pending_supervisor")}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        feedbackStatus === "pending_supervisor"
                          ? "bg-amber-400/20 text-amber-400 border-amber-400/50"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      Pending Supervisor Escalation
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Saving..." : "Save Feedback Entry"}</span>
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
