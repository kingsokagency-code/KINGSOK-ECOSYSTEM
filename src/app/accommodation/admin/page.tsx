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
  getStudentIntelRecords,
  getRegisteredClients,
  getDailyTasks,
  assignAdminDuty,
  deleteDailyTask,
  resetAllDataToCleanSlate,
  CampaignGoal,
  Strategy,
  UserProfile,
  WorkerRole,
  LodgeAsset,
  ClientLead,
  WhatsAppBlastLog,
  CustomerRepLog,
  WorkerRatingEvent,
  DailyDutyTask,
  StudentIntelRecord,
  RegisteredClientRecord,
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
  CheckSquare,
  Target,
  Trash2,
  Calendar,
  AlertCircle,
  Download,
  RotateCcw,
  FileSpreadsheet,
  MapPin,
  Tag,
  GraduationCap,
} from "lucide-react";

interface UnifiedSubmission {
  id: string;
  type: "lodge" | "lead" | "blast" | "rep" | "student" | "client";
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
  const [studentIntel, setStudentIntel] = useState<StudentIntelRecord[]>([]);
  const [registeredClients, setRegisteredClients] = useState<RegisteredClientRecord[]>([]);
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [blasts, setBlasts] = useState<WhatsAppBlastLog[]>([]);
  const [repLogs, setRepLogs] = useState<CustomerRepLog[]>([]);
  const [ratings, setRatings] = useState<WorkerRatingEvent[]>([]);
  const [tasks, setTasks] = useState<DailyDutyTask[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState<
    "stream" | "dispatch" | "workers" | "goals" | "leaderboard"
  >("stream");
  const [streamFilter, setStreamFilter] = useState<
    "all" | "lodge" | "student" | "client" | "rep" | "lead" | "blast"
  >("all");
  const [search, setSearch] = useState("");

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Dispatch Duty Form State
  const [dispatchWorkerId, setDispatchWorkerId] = useState("");
  const [dispatchTitle, setDispatchTitle] = useState("");
  const [dispatchDesc, setDispatchDesc] = useState("");
  const [dispatchTarget, setDispatchTarget] = useState(10);
  const [dispatchUnit, setDispatchUnit] = useState("Lodges Scouted");
  const [dispatchNote, setDispatchNote] = useState("");
  const [dispatching, setDispatching] = useState(false);

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
  const [currentAccommodated, setCurrentAccommodated] = useState(0);
  const [targetReach, setTargetReach] = useState(5000);
  const [currentReach, setCurrentReach] = useState(0);
  const [deadlineText, setDeadlineText] = useState("");

  useEffect(() => {
    async function load() {
      const [
        g,
        strats,
        uList,
        lList,
        intelList,
        clientsList,
        leadList,
        bList,
        rList,
        rates,
        tList,
        cur,
      ] = await Promise.all([
        getCampaignGoal(),
        getStrategies(),
        getUsers(),
        getLodges(),
        getStudentIntelRecords(),
        getRegisteredClients(),
        getClientLeads(),
        getWhatsAppBlasts(),
        getCustomerRepLogs(),
        getWorkerRatings(),
        getDailyTasks(),
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
      setStudentIntel(intelList);
      setRegisteredClients(clientsList);
      setLeads(leadList);
      setBlasts(bList);
      setRepLogs(rList);
      setRatings(rates);
      setTasks(tList);
      if (uList.length > 0) {
        setDispatchWorkerId(uList[0].id);
      }
      setCurrentUser(cur);
    }
    load();
  }, []);

  // Dispatch Task Handler
  const handleDispatchTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === dispatchWorkerId);
    if (!targetUser || !dispatchTitle.trim()) {
      alert("Please select a worker and enter the task title.");
      return;
    }

    setDispatching(true);
    try {
      const created = await assignAdminDuty({
        worker_id: targetUser.id,
        worker_name: targetUser.name,
        role: targetUser.roles[0] || "area_controller",
        title: dispatchTitle.trim(),
        description: dispatchDesc.trim() || `Daily mission directive for ${targetUser.name}`,
        target_count: Number(dispatchTarget) || 10,
        unit_label: dispatchUnit.trim() || "Lodges Scouted",
        admin_note: dispatchNote.trim() || "Priority directive from Okoye",
      });

      setTasks([created, ...tasks]);
      setNotification(`Direct mission dispatched to ${targetUser.name}!`);
      setDispatchTitle("");
      setDispatchDesc("");
      setDispatchNote("");
    } catch (err: any) {
      alert("Error dispatching duty: " + err.message);
    } finally {
      setDispatching(false);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Remove dispatched task "${title}"?`)) return;
    try {
      await deleteDailyTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setNotification(`Dispatched task removed.`);
    } catch (err: any) {
      alert("Error deleting task: " + err.message);
    }
  };

  // Build Unified Submissions List
  const submissions: UnifiedSubmission[] = [
    ...lodges.map((l) => ({
      id: l.id,
      type: "lodge" as const,
      worker_id: l.recorded_by_id,
      worker_name: l.recorded_by_name,
      role: "area_controller" as WorkerRole,
      title: `Lodge Entry: ${l.name} (${l.area})`,
      summary: `Rent: ${l.rent_per_session} • Caretaker: ${l.caretaker_name} (${l.caretaker_phone}) • Vacancy: ${l.vacancy_count} rooms • Water: ${l.water_reliability} • Light: ${l.light_reliability}`,
      created_at: l.created_at,
      points_awarded: l.admin_points_awarded,
      admin_feedback: l.admin_feedback,
    })),
    ...studentIntel.map((s) => ({
      id: s.id,
      type: "student" as const,
      worker_id: s.recorded_by_id,
      worker_name: s.recorded_by_name,
      role: "area_controller" as WorkerRole,
      title:
        s.student_type === "final_year"
          ? `Final-Year Intel: ${s.student_name} (${s.current_lodge_name})`
          : `Transition Intel: ${s.student_name} (${s.current_lodge_name})`,
      summary:
        s.student_type === "final_year"
          ? `Move Date: ${s.expected_move_date} • Room Opening: ${s.room_opening_up ? "Yes" : "No"} • Items For Sale: ${s.items_for_sale || "None"}`
          : `Reason: ${s.reason_for_moving || "N/A"} • Target Area: ${s.preferred_new_area || "N/A"} • Target Budget: ${s.target_budget || "N/A"}`,
      created_at: s.created_at,
      points_awarded: s.admin_points_awarded,
      admin_feedback: s.admin_feedback,
    })),
    ...registeredClients.map((c) => ({
      id: c.id,
      type: "client" as const,
      worker_id: c.registered_by_id,
      worker_name: c.registered_by_name,
      role: "customer_rep" as WorkerRole,
      title: `Client Registration [${c.sector}]: ${c.client_name} (${c.client_category})`,
      summary: `Acquired: ${c.service_or_lodge_acquired} • Payment: ${c.amount_paid || "N/A"} (${c.payment_status.replace("_", " ")}) • Area: ${c.area_or_location} • Phone: ${c.phone}`,
      created_at: c.created_at,
      points_awarded: c.admin_points_awarded,
      admin_feedback: c.admin_feedback,
    })),
    ...repLogs.map((r) => ({
      id: r.id,
      type: "rep" as const,
      worker_name: r.rep_name,
      role: "customer_rep" as WorkerRole,
      title: `Client Feedback: ${r.target_reference} [${r.sector || "Accommodation"}]`,
      summary: `Category: ${r.category} • Rating: ${r.satisfaction_rating || 5} Stars • Status: ${r.status} • Findings: ${r.findings.substring(0, 90)}...`,
      created_at: r.created_at,
      points_awarded: r.admin_points_awarded,
      admin_feedback: r.admin_feedback,
    })),
    ...leads.map((lead) => ({
      id: lead.id,
      type: "lead" as const,
      worker_id: lead.hotliner_id,
      worker_name: lead.hotliner_name,
      role: "hotliner" as WorkerRole,
      title: `Fresher Inquiry: ${lead.fresher_name}`,
      summary: `Phone: ${lead.phone} • Area: ${lead.preferred_area} • Budget: ${lead.budget_range} • Stage: ${lead.status.replace("_", " ")}`,
      created_at: lead.created_at,
      points_awarded: lead.admin_points_awarded,
      admin_feedback: lead.admin_feedback,
    })),
    ...blasts.map((b) => ({
      id: b.id,
      type: "blast" as const,
      worker_name: b.hotliner_name,
      role: "hotliner" as WorkerRole,
      title: `WhatsApp Broadcast: ${b.group_name}`,
      summary: `Broadcast Type: ${b.broadcast_type} • Est. Freshers Reached: ${b.freshers_reached_estimate}`,
      created_at: b.created_at,
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
      `Great effort on ${submission.title}. Keep upholding KINGSOK principles and ground truth!`
    );
    setReviewModalOpen(true);
  };

  // Submit Review & Points
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmittingReview(true);
    try {
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
        submission_type:
          selectedSubmission.type === "lodge"
            ? "lodge"
            : selectedSubmission.type === "lead"
            ? "lead"
            : selectedSubmission.type === "student"
            ? "student"
            : selectedSubmission.type === "client"
            ? "client"
            : "rep",
        submission_id: selectedSubmission.id,
      });

      // Reload updated lists
      const [uList, rates, lList, sList, cList, leadList, rList] = await Promise.all([
        getUsers(),
        getWorkerRatings(),
        getLodges(),
        getStudentIntelRecords(),
        getRegisteredClients(),
        getClientLeads(),
        getCustomerRepLogs(),
      ]);
      setUsers(uList);
      setRatings(rates);
      setLodges(lList);
      setStudentIntel(sList);
      setRegisteredClients(cList);
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

  // Export Modal State & CSV Helpers
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const exportToCSV = (
    filename: string,
    headers: string[],
    rows: (string | number | undefined | null)[][]
  ) => {
    const escapeCell = (val: string | number | undefined | null) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).trim();
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const csvContent =
      "\uFEFF" +
      headers.map(escapeCell).join(",") +
      "\n" +
      rows.map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotification(`Downloaded ${filename}.csv for Excel!`);
  };

  // 1. Export Lodges & Caretakers
  const handleExportLodges = () => {
    const headers = [
      "Lodge Name",
      "Campus Zone / Area",
      "Street Address",
      "Rent Per Session",
      "Current Vacancies",
      "Is Vacant Now",
      "Caretaker Name",
      "Caretaker Phone",
      "Lodge President",
      "President Phone",
      "Shop Contact",
      "Water Reliability",
      "Light Reliability",
      "Room Types",
      "Security Features",
      "Final-Year Students Present",
      "Final-Year Items & Details",
      "Recorded By",
      "Date Recorded",
      "Admin Points Awarded",
      "Admin Feedback",
    ];

    const rows = lodges.map((l) => [
      l.name,
      l.area,
      l.address,
      l.rent_per_session,
      l.vacancy_count,
      l.is_vacant_now ? "YES" : "NO",
      l.caretaker_name,
      l.caretaker_phone,
      l.lodge_president_name || "N/A",
      l.lodge_president_phone || "N/A",
      l.shop_owner_contact || "N/A",
      l.water_reliability,
      l.light_reliability,
      l.room_types || "N/A",
      l.security_features || "N/A",
      l.has_final_year_students ? "YES" : "NO",
      l.final_year_details || "N/A",
      l.recorded_by_name,
      new Date(l.created_at).toLocaleDateString(),
      l.admin_points_awarded || 0,
      l.admin_feedback || "None",
    ]);

    exportToCSV("KINGSOK_Lodges_Directory", headers, rows);
  };

  // 2. Export Final-Year & Transition Student Intel
  const handleExportStudentIntel = () => {
    const headers = [
      "Intel Category",
      "Student Name",
      "Phone Number",
      "Current Lodge",
      "Area / Zone",
      "Room Number / Type",
      "Expected Move Date",
      "Room Opening Up",
      "Items For Sale",
      "Reason For Moving",
      "Preferred New Area",
      "Target Budget",
      "Desired New Room Type",
      "Special Notes",
      "Recorded By",
      "Date Recorded",
      "Admin Points Awarded",
      "Admin Feedback",
    ];

    const rows = studentIntel.map((s) => [
      s.student_type === "final_year" ? "Final-Year (Graduating)" : "Transition (Relocating)",
      s.student_name,
      s.phone,
      s.current_lodge_name,
      s.area,
      s.room_number_or_type || "N/A",
      s.expected_move_date,
      s.room_opening_up ? "YES" : "NO",
      s.items_for_sale || "None",
      s.reason_for_moving || "N/A",
      s.preferred_new_area || "N/A",
      s.target_budget || "N/A",
      s.desired_new_room_type || "N/A",
      s.notes || "None",
      s.recorded_by_name,
      new Date(s.created_at).toLocaleDateString(),
      s.admin_points_awarded || 0,
      s.admin_feedback || "None",
    ]);

    exportToCSV("KINGSOK_Student_Intel", headers, rows);
  };

  // 3. Export Registered Clients Across Sectors
  const handleExportClients = () => {
    const headers = [
      "Sector",
      "Client Name",
      "Phone Number",
      "WhatsApp Phone",
      "Email Address",
      "Client Category",
      "Department / Occupation",
      "Service / Lodge Acquired",
      "Location / Area",
      "Payment Status",
      "Amount Paid",
      "Assigned Staff",
      "Emergency / Parent Contact",
      "Client Notes",
      "Registered By",
      "Date Recorded",
      "Admin Points Awarded",
      "Admin Feedback",
    ];

    const rows = registeredClients.map((c) => [
      c.sector,
      c.client_name,
      c.phone,
      c.whatsapp_phone || "N/A",
      c.email || "N/A",
      c.client_category,
      c.department_or_occupation || "N/A",
      c.service_or_lodge_acquired,
      c.area_or_location,
      c.payment_status.replace("_", " ").toUpperCase(),
      c.amount_paid || "N/A",
      c.assigned_staff_name || "N/A",
      c.emergency_or_parent_contact || "N/A",
      c.notes || "None",
      c.registered_by_name,
      new Date(c.created_at).toLocaleDateString(),
      c.admin_points_awarded || 0,
      c.admin_feedback || "None",
    ]);

    exportToCSV("KINGSOK_Registered_Clients", headers, rows);
  };

  // 4. Export Fresher Leads
  const handleExportLeads = () => {
    const headers = [
      "Student / Fresher Name",
      "Phone Number",
      "Preferred Campus Area",
      "Budget Range",
      "Desired Room Type",
      "Conversion Stage",
      "Assigned Controller",
      "Special Notes / Preferences",
      "Hotliner Staff",
      "Date Recorded",
      "Admin Points Awarded",
      "Admin Feedback",
    ];

    const rows = leads.map((l) => [
      l.fresher_name,
      l.phone,
      l.preferred_area,
      l.budget_range,
      l.desired_room_type,
      l.status.replace("_", " ").toUpperCase(),
      l.assigned_controller_name || "N/A",
      l.notes || "None",
      l.hotliner_name,
      new Date(l.created_at).toLocaleDateString(),
      l.admin_points_awarded || 0,
      l.admin_feedback || "None",
    ]);

    exportToCSV("KINGSOK_Fresher_Leads", headers, rows);
  };

  // 5. Export All Master Datasets sequentially
  const handleExportAll = () => {
    handleExportLodges();
    setTimeout(() => handleExportStudentIntel(), 300);
    setTimeout(() => handleExportClients(), 600);
    setTimeout(() => handleExportLeads(), 900);
    setNotification("Exporting all 4 KINGSOK datasets for Excel...");
  };

  // 6. Reset all local metrics and demo data to clean slate (0)
  const handleResetToCleanSlate = async () => {
    if (
      !confirm(
        "Are you sure you want to initialize a Clean Slate? This will purge all local cached recordings and reset all campaign and zone metrics to 0."
      )
    ) {
      return;
    }

    resetAllDataToCleanSlate();

    const [
      g,
      uList,
      lList,
      intelList,
      clientsList,
      leadList,
      bList,
      rList,
      rates,
      tList,
    ] = await Promise.all([
      getCampaignGoal(),
      getUsers(),
      getLodges(),
      getStudentIntelRecords(),
      getRegisteredClients(),
      getClientLeads(),
      getWhatsAppBlasts(),
      getCustomerRepLogs(),
      getWorkerRatings(),
      getDailyTasks(),
    ]);

    setGoal(g);
    setCurrentAccommodated(g.current_accommodated);
    setCurrentReach(g.current_freshers_reach);
    setUsers(uList);
    setLodges(lList);
    setStudentIntel(intelList);
    setRegisteredClients(clientsList);
    setLeads(leadList);
    setBlasts(bList);
    setRepLogs(rList);
    setRatings(rates);
    setTasks(tList);
    setNotification("Clean slate initialized: all metrics and records zeroed out to ground truth!");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <AccommodationNav />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast Notification */}
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

        {/* ADMIN HEADER */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-400/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-black uppercase tracking-widest text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Administrative Command Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Workforce Operations & Reward Engine
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Review live field submissions across lodges, student intel, and cross-sector clients. Award merit performance points (1 Pt = ₦1,000 cash value), assign multi-role designations, and dispatch daily ground missions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleResetToCleanSlate}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                title="Purge all demo and cached records, resetting metrics to 0"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Zero All (0)</span>
              </button>

              <button
                onClick={() => setExportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export (Excel / CSV)</span>
              </button>

              <button
                onClick={() => setAddWorkerModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700 transition-colors shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Add Worker</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("dispatch");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer border border-emerald-400"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Dispatch Mission</span>
              </button>
            </div>
          </div>
        </div>

        {/* GROUND TRUTH METRIC COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              Points Awarded
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {totalPointsIssued} Pts
            </div>
            <span className="text-[11px] text-neutral-400">Total merit points</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Cash Value
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              ₦{totalCashEarned.toLocaleString()}
            </div>
            <span className="text-[11px] text-neutral-400">@ ₦1,000 per Pt</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              Verified Lodges
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-300 mt-1">
              {lodges.length}
            </div>
            <span className="text-[11px] text-neutral-400">Scouted by Controllers</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
              Student Intel
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">
              {studentIntel.length}
            </div>
            <span className="text-[11px] text-neutral-400">Final-Year & Transition</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Registered Clients
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
              {registeredClients.length}
            </div>
            <span className="text-[11px] text-neutral-400">Cross-sector profiles</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              Active Staff
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {users.length}
            </div>
            <span className="text-[11px] text-neutral-400">On active roster</span>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full md:w-auto">
            <button
              onClick={() => setActiveTab("stream")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "stream"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Submissions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-neutral-300 font-mono">
                {submissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("dispatch")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "dispatch"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Daily Task Dispatcher</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-neutral-300 font-mono">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("workers")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "workers"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Roster</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-neutral-300 font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "goals"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Goals & Playbooks</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Merit Leaderboard</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-neutral-400 text-right pr-2">
            Admin: <strong className="text-white">{currentUser?.name || "Okoye"}</strong>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LIVE FIELD SUBMISSIONS & RATING REVIEWS */}
        {/* ============================================================== */}
        {activeTab === "stream" && (
          <div className="space-y-4">
            {/* Filter Pills & Search */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search worker, lodge, student, client, or details..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
                <button
                  onClick={() => setStreamFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "all"
                      ? "bg-neutral-800 text-white border border-neutral-700"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  All ({submissions.length})
                </button>
                <button
                  onClick={() => setStreamFilter("lodge")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "lodge"
                      ? "bg-sky-950 text-sky-300 border border-sky-800"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  Lodges ({lodges.length})
                </button>
                <button
                  onClick={() => setStreamFilter("student")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "student"
                      ? "bg-purple-950 text-purple-300 border border-purple-800"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  Student Intel ({studentIntel.length})
                </button>
                <button
                  onClick={() => setStreamFilter("client")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "client"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  Clients ({registeredClients.length})
                </button>
                <button
                  onClick={() => setStreamFilter("rep")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "rep"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  Feedback ({repLogs.length})
                </button>
                <button
                  onClick={() => setStreamFilter("lead")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    streamFilter === "lead"
                      ? "bg-blue-950 text-blue-300 border border-blue-800"
                      : "bg-neutral-950 text-neutral-400 hover:text-white"
                  }`}
                >
                  Leads ({leads.length})
                </button>

                <button
                  onClick={() => setExportModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Export Data to Excel/CSV"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Submissions List */}
            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="font-bold text-sm text-neutral-300">No submissions found</p>
                <p className="text-xs">Adjust your search filter or stream type selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-neutral-900 border border-neutral-800 hover:border-emerald-800/80 rounded-2xl p-5 transition-all shadow-md space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              sub.type === "lodge"
                                ? "bg-sky-950 text-sky-300 border-sky-800"
                                : sub.type === "student"
                                ? "bg-purple-950 text-purple-300 border-purple-800"
                                : sub.type === "client"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : sub.type === "rep"
                                ? "bg-amber-950 text-amber-300 border-amber-800"
                                : sub.type === "lead"
                                ? "bg-blue-950 text-blue-300 border-blue-800"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700"
                            }`}
                          >
                            {sub.type.toUpperCase()}
                          </span>

                          <h3 className="text-base font-extrabold text-white">
                            {sub.title}
                          </h3>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                          {sub.summary}
                        </p>
                      </div>

                      {/* Review Action or Reviewed Badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        {sub.points_awarded ? (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>+{sub.points_awarded} Pts Awarded</span>
                          </div>
                        ) : sub.type !== "blast" ? (
                          <button
                            onClick={() => openReviewModal(sub)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Review & Award Points</span>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Admin Feedback note if exists */}
                    {sub.admin_feedback && (
                      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 space-y-0.5">
                        <strong className="text-amber-400 block text-[11px] uppercase tracking-wider">
                          Admin Coaching Note:
                        </strong>
                        <p>{sub.admin_feedback}</p>
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2.5">
                      <span className="flex items-center gap-2">
                        <span>Staff: <strong className="text-neutral-200">{sub.worker_name}</strong></span>
                        <span>&bull;</span>
                        <span>Role: <strong className="text-neutral-200">{sub.role.replace("_", " ")}</strong></span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DAILY TASK DISPATCHER */}
        {/* ============================================================== */}
        {activeTab === "dispatch" && (
          <div className="space-y-6">
            {/* Dispatch Form Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">
                    Dispatch Direct Daily Mission
                  </h3>
                </div>
                <span className="text-xs text-neutral-400">
                  Appears live on the assigned worker&apos;s daily task tracker
                </span>
              </div>

              <form onSubmit={handleDispatchTask} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                      Assign To Worker *
                    </label>
                    <select
                      value={dispatchWorkerId}
                      onChange={(e) => setDispatchWorkerId(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roles.join(", ")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                      Mission Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Map 15 New Lodges in Odim Gate Area"
                      value={dispatchTitle}
                      onChange={(e) => setDispatchTitle(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                      Target Count *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={dispatchTarget}
                      onChange={(e) => setDispatchTarget(Number(e.target.value))}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                      Metric Unit Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lodges Scouted, Clients Registered"
                      value={dispatchUnit}
                      onChange={(e) => setDispatchUnit(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                      Priority Admin Directive Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High priority before semester begins"
                      value={dispatchNote}
                      onChange={(e) => setDispatchNote(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                    Mission Description & Operational Guidance
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide specific instructions, areas to cover, and expected standards..."
                    value={dispatchDesc}
                    onChange={(e) => setDispatchDesc(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={dispatching}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 border border-emerald-400"
                  >
                    <Send className="w-4 h-4" />
                    <span>{dispatching ? "Dispatching..." : "Dispatch Daily Mission"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Dispatched Tasks List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-extrabold text-white text-base">
                  Active Dispatched Missions ({tasks.length})
                </h3>
                <span className="text-xs text-neutral-400">
                  Track ground completion progress in real-time
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 space-y-1">
                  <CheckSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-bold text-neutral-300">No active dispatched tasks</p>
                  <p className="text-xs">Use the form above to dispatch daily targets to staff.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {tasks.map((task) => {
                    const percent = Math.min(
                      100,
                      Math.round(((task.completed_count || 0) / (task.target_count || 1)) * 100)
                    );

                    return (
                      <div
                        key={task.id}
                        className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">
                                {task.title}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  task.is_completed
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                    : "bg-amber-950 text-amber-300 border-amber-800"
                                }`}
                              >
                                {task.is_completed ? "Completed" : "In Progress"}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-400">
                              {task.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            title="Remove Task"
                            className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-neutral-400">
                            <span>
                              Progress: <strong className="text-white font-mono">{task.completed_count}</strong> / {task.target_count} {task.unit_label}
                            </span>
                            <span className="font-mono font-bold text-emerald-400">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Task Meta */}
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-900 pt-2">
                          <span>
                            Assigned to: <strong className="text-neutral-300">{task.worker_name}</strong> ({task.role.replace("_", " ")})
                          </span>
                          <span>
                            Directive: <em className="text-neutral-400">&quot;{task.admin_note}&quot;</em>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: WORKER ROSTER & MULTI-ROLES */}
        {/* ============================================================== */}
        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Active Staff Roster ({users.length})
                </h3>
                <p className="text-xs text-neutral-400">
                  Toggle roles dynamically or register new staff members into the ecosystem.
                </p>
              </div>

              <button
                onClick={() => setAddWorkerModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Worker</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-extrabold text-white">
                        {worker.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-mono">
                        {worker.email} {worker.phone && `• ${worker.phone}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-300 flex items-center gap-1 justify-end">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{worker.total_points || 0} Pts</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        ₦{((worker.total_points || 0) * 1000).toLocaleString()} Value
                      </span>
                    </div>
                  </div>

                  {/* Multi-Role Toggles */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Assigned Operational Roles:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "area_controller")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("area_controller")
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                            : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          <span>Area Controller</span>
                        </span>
                        {worker.roles.includes("area_controller") && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "hotliner")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("hotliner")
                            ? "bg-sky-950 text-sky-300 border-sky-700"
                            : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5" />
                          <span>Hotliner / Blast</span>
                        </span>
                        {worker.roles.includes("hotliner") && (
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "customer_rep")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("customer_rep")
                            ? "bg-amber-950 text-amber-300 border-amber-700"
                            : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Customer Rep</span>
                        </span>
                        {worker.roles.includes("customer_rep") && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleWorkerRole(worker.id, "admin")}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                          worker.roles.includes("admin")
                            ? "bg-purple-950 text-purple-300 border-purple-700"
                            : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin Center</span>
                        </span>
                        {worker.roles.includes("admin") && (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: GOALS & OPERATIONAL PLAYBOOKS */}
        {/* ============================================================== */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">
                    Active Intake Campaign Goal Settings
                  </h3>
                </div>
                <span className="text-xs text-neutral-400">
                  Updates dynamically across all worker portals
                </span>
              </div>

              <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-300 mb-1">
                    Goal Banner Title
                  </label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <span className="font-bold text-white block text-xs">
                      Accommodated Students Targets
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          Target Students
                        </label>
                        <input
                          type="number"
                          value={targetAccommodated}
                          onChange={(e) => setTargetAccommodated(Number(e.target.value))}
                          className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          Current Housed
                        </label>
                        <input
                          type="number"
                          value={currentAccommodated}
                          onChange={(e) => setCurrentAccommodated(Number(e.target.value))}
                          className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-emerald-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <span className="font-bold text-white block text-xs">
                      Fresher Outreach Targets
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          Target Reach
                        </label>
                        <input
                          type="number"
                          value={targetReach}
                          onChange={(e) => setTargetReach(Number(e.target.value))}
                          className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                          Current Reached
                        </label>
                        <input
                          type="number"
                          value={currentReach}
                          onChange={(e) => setCurrentReach(Number(e.target.value))}
                          className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sky-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors border border-emerald-400"
                  >
                    Save Campaign Goal Updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: WORKER PERFORMANCE LEADERBOARD */}
        {/* ============================================================== */}
        {activeTab === "leaderboard" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Ecosystem Merit Leaderboard
                </h3>
                <p className="text-xs text-neutral-400">
                  Ranked by total points earned through verified ground truth and quality execution.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-amber-400 block uppercase tracking-wider">
                  Conversion Rate
                </span>
                <span className="text-xs font-bold text-white">1 Point = ₦1,000 Cash</span>
              </div>
            </div>

            <div className="space-y-3">
              {[...users]
                .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
                .map((w, index) => (
                  <div
                    key={w.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          index === 0
                            ? "bg-amber-400 text-neutral-950 shadow-md"
                            : index === 1
                            ? "bg-neutral-300 text-neutral-900"
                            : index === 2
                            ? "bg-amber-700 text-white"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-sm">
                          {w.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {w.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-semibold text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800"
                            >
                              {r.replace("_", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-white flex items-center gap-1 justify-end">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{w.total_points || 0} Pts</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-800 space-y-5 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      Award Stars & Merit Points
                    </h3>
                    <p className="text-[11px] text-neutral-400">1 Point = ₦1,000 direct cash value</p>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Submission Banner */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Submission Reviewed:
                </span>
                <div className="font-extrabold text-white">{selectedSubmission.title}</div>
                <div className="text-neutral-400">
                  Submitted by: <strong className="text-neutral-200">{selectedSubmission.worker_name}</strong> ({selectedSubmission.role.replace("_", " ")})
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* 1 to 5 Star Rating */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
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
                            ? "bg-amber-950 border-amber-500 text-amber-400 scale-105"
                            : "bg-neutral-950 border-neutral-800 text-neutral-600"
                        }`}
                      >
                        <Star className={`w-5 h-5 ${stars >= starCount ? "fill-amber-400" : ""}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-neutral-200 ml-2">
                      {stars} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Points Award (1 to 5) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                    Award Merit Performance Points *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((pt) => (
                      <button
                        type="button"
                        key={pt}
                        onClick={() => setPoints(pt)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                          points === pt
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                            : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        +{pt} Pt{pt > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-200">Worker Cash Value Earned:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      ₦{(points * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Coaching Comment */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1.5">
                    Coaching Feedback & Recognition
                  </label>
                  <textarea
                    rows={3}
                    value={coachingComment}
                    onChange={(e) => setCoachingComment(e.target.value)}
                    placeholder="Commend their diligence, detail on caretaker/president contacts, or provide constructive guidance..."
                    className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-emerald-500 font-medium text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 border border-emerald-400"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-800 space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      Add New Worker Profile
                    </h3>
                    <p className="text-[11px] text-neutral-400">Enable multi-role assignments</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddWorkerModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="e.g. Obinna Eze"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-emerald-500 font-medium text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newWorkerEmail}
                    onChange={(e) => setNewWorkerEmail(e.target.value)}
                    placeholder="obinna@kingsok.com"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-emerald-500 font-medium text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newWorkerPhone}
                    onChange={(e) => setNewWorkerPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl outline-none focus:border-emerald-500 font-medium text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Initial Assigned Roles
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
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                              : "bg-neutral-950 text-neutral-500 border-neutral-800"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setAddWorkerModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors cursor-pointer border border-emerald-400"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Worker</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXPORT DATA (EXCEL / CSV) MODAL */}
        {/* ============================================================== */}
        {exportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-800 space-y-5 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      Export Data (Excel & CSV)
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Clean UTF-8 encoded files formatted for Microsoft Excel & Google Sheets
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. Lodges */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-sky-400" />
                      <span>Lodges & Caretakers Directory</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {lodges.length} records &bull; Names, zones, caretaker contacts, vacancies, rent, light/water truth
                    </p>
                  </div>
                  <button
                    onClick={handleExportLodges}
                    className="px-3.5 py-2 rounded-xl bg-sky-950 text-sky-300 border border-sky-800 hover:bg-sky-900 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                {/* 2. Student Intel */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span>Final-Year & Transition Intel</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {studentIntel.length} records &bull; Vacating dates, items for sale, reasons for moving, budgets
                    </p>
                  </div>
                  <button
                    onClick={handleExportStudentIntel}
                    className="px-3.5 py-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                {/* 3. Registered Clients */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Registered Clients (Cross-Sector)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {registeredClients.length} records &bull; Across Accommodation, Properties, Rentals, Food
                    </p>
                  </div>
                  <button
                    onClick={handleExportClients}
                    className="px-3.5 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                {/* 4. Fresher Leads */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-blue-400" />
                      <span>Fresher Inquiries & Leads</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {leads.length} records &bull; Contact info, areas, budgets, room types, conversion stages
                    </p>
                  </div>
                  <button
                    onClick={handleExportLeads}
                    className="px-3.5 py-2 rounded-xl bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Master Export Action */}
              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-neutral-400">
                  Total Ecosystem Records: <strong className="text-white">{lodges.length + studentIntel.length + registeredClients.length + leads.length}</strong>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setExportModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors cursor-pointer border border-emerald-400"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export All Datasets</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
