"use client";

import React, { useEffect, useState } from "react";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getCampaignGoal,
  updateCampaignGoal,
  getStrategies,
  saveStrategy,
  getUsers,
  updateUserRoles,
  registerOrUpdateUser,
  getLodges,
  getClientLeads,
  getWhatsAppBlasts,
  getCustomerRepLogs,
  getWorkerRatings,
  awardWorkerRatingAndPoints,
  getCurrentUser,
  CampaignGoal,
  Strategy,
  UserProfile,
  WorkerRole,
  LodgeAsset,
  ClientLead,
  WhatsAppBlastLog,
  CustomerRepLog,
  WorkerRatingEvent,
} from "@/lib/accommodation-service";
import {
  ShieldAlert,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Star,
  Coins,
  Send,
  X,
  PlusCircle,
  Building,
  Radio,
  Headphones,
  Edit3,
  Search,
  Filter,
  Check,
  TrendingUp,
  MessageSquare,
  Clock,
  DollarSign,
  UserPlus,
} from "lucide-react";

interface UnifiedSubmission {
  id: string;
  type: "lodge" | "lead" | "blast" | "rep";
  worker_id?: string;
  worker_name: string;
  role: WorkerRole;
  title: string;
  summary: string;
  created_at: string;
  points_awarded?: number;
  admin_feedback?: string;
}

export default function AdminCommandCenter() {
  const [goal, setGoal] = useState<CampaignGoal | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lodges, setLodges] = useState<LodgeAsset[]>([]);
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [blasts, setBlasts] = useState<WhatsAppBlastLog[]>([]);
  const [repLogs, setRepLogs] = useState<CustomerRepLog[]>([]);
  const [ratings, setRatings] = useState<WorkerRatingEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState<"stream" | "workers" | "goals" | "leaderboard">("stream");
  const [streamFilter, setStreamFilter] = useState<"all" | "lodge" | "lead" | "blast" | "rep">("all");
  const [search, setSearch] = useState("");

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Review & Award Points Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<UnifiedSubmission | null>(null);
  const [stars, setStars] = useState(5);
  const [points, setPoints] = useState(2);
  const [coachingComment, setCoachingComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add Worker Modal State
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newWorkerPhone, setNewWorkerPhone] = useState("");
  const [newWorkerRoles, setNewWorkerRoles] = useState<WorkerRole[]>(["area_controller"]);

  // Goal Editing State
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [targetAccommodated, setTargetAccommodated] = useState(500);
  const [currentAccommodated, setCurrentAccommodated] = useState(42);
  const [targetReach, setTargetReach] = useState(5000);
  const [currentReach, setCurrentReach] = useState(840);
  const [deadlineText, setDeadlineText] = useState("");

  useEffect(() => {
    async function load() {
      const [g, strats, uList, lList, leadList, bList, rList, rates, cur] = await Promise.all([
        getCampaignGoal(),
        getStrategies(),
        getUsers(),
        getLodges(),
        getClientLeads(),
        getWhatsAppBlasts(),
        getCustomerRepLogs(),
        getWorkerRatings(),
        getCurrentUser(),
      ]);

      setGoal(g);
      setGoalTitle(g.title);
      setTargetAccommodated(g.target_accommodated);
      setCurrentAccommodated(g.current_accommodated);
      setTargetReach(g.target_freshers_reach);
      setCurrentReach(g.current_freshers_reach);
      setDeadlineText(g.deadline_text);

      setStrategies(strats);
      setUsers(uList);
      setLodges(lList);
      setLeads(leadList);
      setBlasts(bList);
      setRepLogs(rList);
      setRatings(rates);
      setCurrentUser(cur);
    }
    load();
  }, []);

  // Build Unified Submissions List
  const submissions: UnifiedSubmission[] = [
    ...lodges.map((l) => ({
      id: l.id,
      type: "lodge" as const,
      worker_id: l.recorded_by_id,
      worker_name: l.recorded_by_name,
      role: "area_controller" as WorkerRole,
      title: `Lodge Entry: ${l.name} (${l.area})`,
      summary: `Rent: ${l.rent_per_session} &bull; Caretaker: ${l.caretaker_name} (${l.caretaker_phone}) &bull; Vacancy: ${l.vacancy_count} rooms &bull; Water: ${l.water_reliability} &bull; Light: ${l.light_reliability}`,
      created_at: l.created_at,
      points_awarded: l.admin_points_awarded,
      admin_feedback: l.admin_feedback,
    })),
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      worker_id: lead.hotliner_id,
      worker_name: lead.hotliner_name,
      role: "hotliner" as WorkerRole,
      title: `Fresher Inquiry: ${lead.fresher_name}`,
      summary: `Phone: ${lead.phone} &bull; Area: ${lead.preferred_area} &bull; Budget: ${lead.budget_range} &bull; Status: ${lead.status.replace("_", " ")}`,
      created_at: lead.created_at,
      points_awarded: lead.admin_points_awarded,
    })),
    ...blasts.map((b) => ({
      id: b.id,
      type: "blast" as const,
      worker_name: b.hotliner_name,
      role: "hotliner" as WorkerRole,
      title: `WhatsApp Broadcast: ${b.group_name}`,
      summary: `Broadcast Type: ${b.broadcast_type} &bull; Est. Freshers Reached: ${b.freshers_reached_estimate}`,
      created_at: b.created_at,
    })),
    ...repLogs.map((r) => ({
      id: r.id,
      type: "rep" as const,
      worker_name: r.rep_name,
      role: "customer_rep" as WorkerRole,
      title: `Quality Audit: ${r.target_reference}`,
      summary: `Category: ${r.category} &bull; Status: ${r.status} &bull; Findings: ${r.findings.substring(0, 90)}...`,
      created_at: r.created_at,
      points_awarded: r.admin_points_awarded,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchType = streamFilter === "all" || s.type === streamFilter;
    const matchSearch =
      s.worker_name.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Open Review Modal
  const openReviewModal = (submission: UnifiedSubmission) => {
    setSelectedSubmission(submission);
    setStars(5);
    setPoints(2);
    setCoachingComment(
      `Great effort on ${submission.title}. Keep upholding truthfulness and thorough record-keeping!`
    );
    setReviewModalOpen(true);
  };

  // Submit Review & Points
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmittingReview(true);
    try {
      // Find worker profile by worker_id or name
      const worker =
        users.find((u) => u.id === selectedSubmission.worker_id) ||
        users.find((u) => u.name.toLowerCase() === selectedSubmission.worker_name.toLowerCase()) ||
        users[0];

      await awardWorkerRatingAndPoints({
        worker_id: worker.id,
        worker_name: worker.name,
        role: selectedSubmission.role,
        task_reference: selectedSubmission.title,
        points_awarded: points,
        rating_stars: stars,
        coaching_comment: coachingComment.trim(),
        submission_type: selectedSubmission.type === "lodge" ? "lodge" : selectedSubmission.type === "lead" ? "lead" : "rep",
        submission_id: selectedSubmission.id,
      });

      // Reload updated lists
      const [uList, rates, lList, leadList, rList] = await Promise.all([
        getUsers(),
        getWorkerRatings(),
        getLodges(),
        getClientLeads(),
        getCustomerRepLogs(),
      ]);
      setUsers(uList);
      setRatings(rates);
      setLodges(lList);
      setLeads(leadList);
      setRepLogs(rList);

      setNotification(
        `Awarded ${points} Points (₦${(points * 1000).toLocaleString()}) & ${stars} Stars to ${worker.name}!`
      );
      setReviewModalOpen(false);
    } catch (err: any) {
      alert("Error submitting review: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Toggle Worker Role
  const handleToggleWorkerRole = async (userId: string, roleToToggle: WorkerRole) => {
    const worker = users.find((u) => u.id === userId);
    if (!worker) return;

    let updatedRoles: WorkerRole[];
    if (worker.roles.includes(roleToToggle)) {
      if (worker.roles.length === 1) {
        alert("Worker must have at least one assigned role.");
        return;
      }
      updatedRoles = worker.roles.filter((r) => r !== roleToToggle);
    } else {
      updatedRoles = [...worker.roles, roleToToggle];
    }

    try {
      const updatedUser = await updateUserRoles(userId, updatedRoles);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      setNotification(`Updated roles for ${updatedUser.name}: ${updatedRoles.join(", ")}`);
    } catch (err: any) {
      alert("Error updating role: " + err.message);
    }
  };

  // Add Worker Profile
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerEmail.trim()) {
      alert("Please provide worker name and email.");
      return;
    }

    try {
      const created = await registerOrUpdateUser({
        name: newWorkerName.trim(),
        email: newWorkerEmail.trim(),
        phone: newWorkerPhone.trim(),
        roles: newWorkerRoles,
      });

      setUsers(await getUsers());
      setNotification(`Worker profile created for ${created.name}!`);
      setAddWorkerModalOpen(false);

      // Reset
      setNewWorkerName("");
      setNewWorkerEmail("");
      setNewWorkerPhone("");
      setNewWorkerRoles(["area_controller"]);
    } catch (err: any) {
      alert("Error adding worker: " + err.message);
    }
  };

  // Save Primary Goal Updates
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateCampaignGoal({
        title: goalTitle.trim(),
        target_accommodated: Number(targetAccommodated),
        current_accommodated: Number(currentAccommodated),
        target_freshers_reach: Number(targetReach),
        current_freshers_reach: Number(currentReach),
        deadline_text: deadlineText.trim(),
      });
      setGoal(updated);
      setEditingGoal(false);
      setNotification("Primary campaign goals updated successfully!");
    } catch (err: any) {
      alert("Error updating goal: " + err.message);
    }
  };

  const totalPointsIssued = users.reduce((acc, curr) => acc + (curr.total_points || 0), 0);
  const totalCashEarned = totalPointsIssued * 1000;

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

        {/* ADMIN HEADER */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                Administrative Command Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Workforce Operations & Reward Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Review live field submissions, award performance points (1 pt = ₦1,000 cash reward), assign multi-roles
                to workers, and configure accommodation targets for the intake campaign.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAddWorkerModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Add Worker</span>
              </button>

              <button
                onClick={() => setEditingGoal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit 500-Student Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* WORKFORCE TOTALS & CASH VALUE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Workforce</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {users.length} Workers
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">
              Multi-role enabled
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Field Submissions</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {submissions.length}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {lodges.length} lodges &bull; {leads.length} leads
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Points Awarded</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {totalPointsIssued} Pts
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              {ratings.length} rating reviews recorded
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cash Reward Value</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
              ₦{totalCashEarned.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              1 Point = ₦1,000 cash value
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("stream")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "stream"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live Field Stream & Reviews ({submissions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("workers")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "workers"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Multi-Role Workforce ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("goals")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "goals"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Goals & Playbooks</span>
              </button>

              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "leaderboard"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Rewards Leaderboard</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 text-right">
              Active Admin: {currentUser?.name || "Okoye"}
            </div>
          </div>

          {/* Search bar & Type filter */}
          {activeTab === "stream" && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search worker name, lodge, lead, or details..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                <button
                  onClick={() => setStreamFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    streamFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStreamFilter("lodge")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    streamFilter === "lodge" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Lodges
                </button>
                <button
                  onClick={() => setStreamFilter("lead")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    streamFilter === "lead" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Leads
                </button>
                <button
                  onClick={() => setStreamFilter("blast")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    streamFilter === "blast" ? "bg-purple-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Blasts
                </button>
                <button
                  onClick={() => setStreamFilter("rep")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    streamFilter === "rep" ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Customer Rep
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LIVE FIELD STREAM & RATING REVIEWS */}
        {/* ============================================================== */}
        {activeTab === "stream" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Live Submissions Feed & Review Desk
              </span>
              <span>Click &quot;Review & Award Points&quot; to award stars and cash value</span>
            </div>

            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        sub.type === "lodge"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : sub.type === "lead"
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : sub.type === "blast"
                          ? "bg-purple-100 text-purple-900 border-purple-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}
                    >
                      {sub.type === "lodge"
                        ? "Area Controller"
                        : sub.type === "rep"
                        ? "Customer Rep"
                        : "Hotliner"}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {sub.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">
                      By <strong className="text-slate-900">{sub.worker_name}</strong>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(sub.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sub.summary }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {sub.points_awarded ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>+{sub.points_awarded} Points Awarded</span>
                        <span className="text-[11px] text-emerald-700 font-mono">
                          (₦{(sub.points_awarded * 1000).toLocaleString()})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Not yet rated by Admin
                      </span>
                    )}

                    {sub.admin_feedback && (
                      <span className="text-xs text-slate-500 italic max-w-md truncate">
                        &ldquo;{sub.admin_feedback}&rdquo;
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openReviewModal(sub)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sub.points_awarded ? "Re-evaluate / Edit Reward" : "Review & Award Points"}</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No submissions found matching criteria.</p>
                <p className="text-xs text-slate-400">All submissions from the field appear here for review.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MULTI-ROLE WORKFORCE MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Staff Multi-Role Capability Roster
              </span>
              <span>One worker can hold multiple field roles simultaneously</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-800 border border-slate-200">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {worker.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          {worker.email} &bull; {worker.phone}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{worker.rating_average || 5.0}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-mono font-bold block mt-0.5">
                        ₦{(worker.cash_value_earned || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Role Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Toggle Assigned Roles (Click to Enable / Disable)
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "area_controller")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("area_controller")
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>Area Controller</span>
                        </span>
                        {worker.roles.includes("area_controller") && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "hotliner")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("hotliner")
                            ? "bg-blue-50 text-blue-900 border-blue-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5" />
                          <span>Hotliner / Blast</span>
                        </span>
                        {worker.roles.includes("hotliner") && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "customer_rep")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("customer_rep")
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Customer Rep</span>
                        </span>
                        {worker.roles.includes("customer_rep") && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "admin")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("admin")
                            ? "bg-purple-50 text-purple-900 border-purple-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin Center</span>
                        </span>
                        {worker.roles.includes("admin") && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    </div>
                  </div>

                  {/* Worker Points & Cash Balance */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                    <span className="text-slate-500">Reward Balance:</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {worker.total_points || 0} Points &bull; ₦{((worker.total_points || 0) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GOALS & OPERATIONAL PLAYBOOKS */}
        {/* ============================================================== */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            {/* Primary Goal Editor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-base">
                    Active Intake Primary Goal
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Updates live across all worker portals</span>
              </div>

              <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Goal Banner Title
                  </label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-semibold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 block text-xs">Accommodated Students Targets</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Target Students
                        </label>
                        <input
                          type="number"
                          value={targetAccommodated}
                          onChange={(e) => setTargetAccommodated(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Current Housed
                        </label>
                        <input
                          type="number"
                          value={currentAccommodated}
                          onChange={(e) => setCurrentAccommodated(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 block text-xs">Fresher Outreach Targets</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Target Reach
                        </label>
                        <input
                          type="number"
                          value={targetReach}
                          onChange={(e) => setTargetReach(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Current Reached
                        </label>
                        <input
                          type="number"
                          value={currentReach}
                          onChange={(e) => setCurrentReach(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-blue-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Target Academic Session / Deadline
                  </label>
                  <input
                    type="text"
                    required
                    value={deadlineText}
                    onChange={(e) => setDeadlineText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-medium"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Campaign Goals</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Operational Playbooks List */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-base">
                Operational Playbooks & Strategies
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategies.map((strat) => (
                  <div
                    key={strat.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {strat.category.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {strat.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {strat.summary}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Action Steps:</span>
                      {strat.action_steps.map((st, i) => (
                        <div key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: REWARDS LEADERBOARD */}
        {/* ============================================================== */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                Staff Performance & Payout Leaderboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated on live points earned: <strong>1 Point = ₦1,000 cash reward value</strong>
              </p>
            </div>

            <div className="space-y-3">
              {[...users]
                .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                .map((w, index) => (
                  <div
                    key={w.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      index === 0
                        ? "bg-amber-50/70 border-amber-300"
                        : index === 1
                        ? "bg-slate-50/80 border-slate-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          index === 0
                            ? "bg-amber-400 text-amber-950 shadow-xs"
                            : index === 1
                            ? "bg-slate-300 text-slate-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {w.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {w.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {r.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 flex items-center gap-1 justify-end">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{w.total_points || 0} Pts</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 block">
                        ₦{((w.total_points || 0) * 1000).toLocaleString()} Value
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ONE-CLICK STAR RATING & POINTS AWARD MODAL */}
        {/* ============================================================== */}
        {reviewModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Award Stars & Performance Points
                    </h3>
                    <p className="text-[11px] text-slate-500">1 Point = ₦1,000 cash value for the worker</p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Task Reference Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission:</span>
                <div className="font-extrabold text-slate-900">{selectedSubmission.title}</div>
                <div className="text-slate-600">Submitted by: <strong>{selectedSubmission.worker_name}</strong></div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* 1 to 5 Star Rating */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Quality Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starCount) => (
                      <button
                        type="button"
                        key={starCount}
                        onClick={() => setStars(starCount)}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          stars >= starCount
                            ? "bg-amber-50 border-amber-300 text-amber-500 scale-105"
                            : "bg-slate-50 border-slate-200 text-slate-300"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${stars >= starCount ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-slate-700 ml-2">
                      {stars} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Points Award (1 to 5) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Award Performance Points *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((pt) => (
                      <button
                        type="button"
                        key={pt}
                        onClick={() => setPoints(pt)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                          points === pt
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        +{pt} Pt{pt > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>

                  {/* Cash Value Calculation Preview */}
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-900">Direct Worker Reward Value:</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      ₦{(points * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Coaching & Constructive Feedback */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Coaching Feedback & Recognition
                  </label>
                  <textarea
                    rows={3}
                    value={coachingComment}
                    onChange={(e) => setCoachingComment(e.target.value)}
                    placeholder="Commend their diligence, detail on caretaker/president contacts, or provide constructive guidance..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? "Submitting..." : "Award Points & Stars"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADD WORKER PROFILE MODAL */}
        {/* ============================================================== */}
        {addWorkerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Add New Worker Profile
                    </h3>
                    <p className="text-[11px] text-slate-500">Enable multi-role assignments</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddWorkerModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="e.g. Obinna Eze"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newWorkerEmail}
                    onChange={(e) => setNewWorkerEmail(e.target.value)}
                    placeholder="obinna@kingsok.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newWorkerPhone}
                    onChange={(e) => setNewWorkerPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-slate-800 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Initial Roles (Multi-Role Enabled)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "area_controller", label: "Area Controller" },
                      { id: "hotliner", label: "Hotliner" },
                      { id: "customer_rep", label: "Customer Rep" },
                      { id: "admin", label: "Admin" },
                    ].map((r) => {
                      const isSelected = newWorkerRoles.includes(r.id as WorkerRole);
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => {
                            if (isSelected) {
                              if (newWorkerRoles.length > 1) {
                                setNewWorkerRoles(newWorkerRoles.filter((role) => role !== r.id));
                              }
                            } else {
                              setNewWorkerRoles([...newWorkerRoles, r.id as WorkerRole]);
                            }
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddWorkerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Worker</span>
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
