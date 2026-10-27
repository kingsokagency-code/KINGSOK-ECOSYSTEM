"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getLodges,
  createLodge,
  updateLodgeAsset,
  deleteLodgeAsset,
  getStudentIntelRecords,
  createStudentIntelRecord,
  updateStudentIntelRecord,
  deleteStudentIntelRecord,
  getCurrentUser,
  getUsers,
  getTerritoryZones,
  getClientApproachGuide,
  getLodgeApplications,
  createLodgeApplication,
  getOrGenerateDailyTasks,
  incrementTaskProgress,
  toggleTaskComplete,
  NSUKKA_CAMPUS_AREAS,
  LodgeAsset,
  StudentIntelRecord,
  StudentIntelType,
  UserProfile,
  TerritoryZone,
  ClientApproachGuide,
  LodgeAgencyApplication,
  DailyDutyTask,
} from "@/lib/accommodation-service";
import {
  Building,
  PlusCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Award,
  GraduationCap,
  Droplets,
  Zap,
  Shield,
  User,
  Calendar,
  X,
  Send,
  Compass,
  FileCheck2,
  CheckSquare,
  Square,
  TrendingUp,
  MapPin,
  BookOpen,
  ArrowRight,
  Handshake,
  Users2,
  Target,
  Edit2,
  Trash2,
  MoveRight,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function AreaControllerWorkspace() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lodges, setLodges] = useState<LodgeAsset[]>([]);
  const [students, setStudents] = useState<StudentIntelRecord[]>([]);
  const [zones, setZones] = useState<TerritoryZone[]>([]);
  const [tasks, setTasks] = useState<DailyDutyTask[]>([]);
  const [applications, setApplications] = useState<LodgeAgencyApplication[]>([]);
  const [guide, setGuide] = useState<ClientApproachGuide | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"missions" | "lodges" | "students" | "agency" | "territory">("missions");
  const [search, setSearch] = useState("");
  const [filterVacancyOnly, setFilterVacancyOnly] = useState(false);
  const [filterFinalYearOnly, setFilterFinalYearOnly] = useState(false);
  const [studentFilter, setStudentFilter] = useState<"all" | "final_year" | "transition">("all");

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [editingLodgeId, setEditingLodgeId] = useState<string | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lodge Form State
  const [lodgeName, setLodgeName] = useState("");
  const [area, setArea] = useState("Hilltop");
  const [address, setAddress] = useState("");
  const [caretakerName, setCaretakerName] = useState("");
  const [caretakerPhone, setCaretakerPhone] = useState("");
  const [lodgePresidentName, setLodgePresidentName] = useState("");
  const [lodgePresidentPhone, setLodgePresidentPhone] = useState("");
  const [shopOwnerContact, setShopOwnerContact] = useState("");
  const [isVacantNow, setIsVacantNow] = useState(true);
  const [vacancyCount, setVacancyCount] = useState(1);
  const [expectedVacancyDate, setExpectedVacancyDate] = useState("Immediate");
  const [hasFinalYearStudents, setHasFinalYearStudents] = useState(false);
  const [finalYearDetails, setFinalYearDetails] = useState("");
  const [rentPerSession, setRentPerSession] = useState("₦250,000 / year");
  const [waterReliability, setWaterReliability] = useState<"Reliable Borehole" | "Occasional" | "Public Tap Only">("Reliable Borehole");
  const [lightReliability, setLightReliability] = useState<"Regular Grid" | "Generator Supported" | "Poor">("Regular Grid");
  const [roomTypes, setRoomTypes] = useState("Self-contain");
  const [securityFeatures, setSecurityFeatures] = useState("Compound gate with night lock, fenced premises");

  // Student Intel Form State
  const [studentType, setStudentType] = useState<StudentIntelType>("final_year");
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentLodgeName, setStudentLodgeName] = useState("");
  const [studentArea, setStudentArea] = useState("Hilltop");
  const [studentRoomNumber, setStudentRoomNumber] = useState("");
  const [studentExpectedMoveDate, setStudentExpectedMoveDate] = useState("End of Session (July)");
  const [studentRoomOpeningUp, setStudentRoomOpeningUp] = useState(true);
  const [studentItemsForSale, setStudentItemsForSale] = useState("");
  const [studentReasonForMoving, setStudentReasonForMoving] = useState("");
  const [studentPreferredNewArea, setStudentPreferredNewArea] = useState("Hilltop");
  const [studentTargetBudget, setStudentTargetBudget] = useState("₦250,000 - ₦300,000");
  const [studentDesiredRoomType, setStudentDesiredRoomType] = useState("Self-contain with reliable water");
  const [studentNotes, setStudentNotes] = useState("");

  // Agency Application Form State
  const [appLodgeName, setAppLodgeName] = useState("");
  const [appArea, setAppArea] = useState("Hilltop");
  const [appCaretakerName, setAppCaretakerName] = useState("");
  const [appCaretakerPhone, setAppCaretakerPhone] = useState("");
  const [appTerms, setAppTerms] = useState("10% Agency commission, 0 upfront cost, 100% verified student intake");
  const [appNotes, setAppNotes] = useState("");

  useEffect(() => {
    async function load() {
      const [cur, uList, lList, sList, zList, apps, g] = await Promise.all([
        getCurrentUser(),
        getUsers(),
        getLodges(),
        getStudentIntelRecords(),
        getTerritoryZones(),
        getLodgeApplications(),
        getClientApproachGuide(),
      ]);

      setCurrentUser(cur);
      setUsers(uList);
      setLodges(lList);
      setStudents(sList);
      setZones(zList);
      setApplications(apps);
      setGuide(g);

      if (cur) {
        const tList = await getOrGenerateDailyTasks(cur.id, "area_controller");
        setTasks(tList);
      }
    }
    load();
  }, []);

  // Task Progress Handlers
  const handleIncrementTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await incrementTaskProgress(taskId, 1);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setNotification(`Progress recorded: ${updated.completed_count} / ${updated.target_count} ${updated.unit_label}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await toggleTaskComplete(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setNotification(updated.is_completed ? "Task marked complete! 🎯" : "Task reopened");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Open Lodge Modal for Add
  const handleOpenAddLodge = () => {
    setEditingLodgeId(null);
    setLodgeName("");
    setArea("Hilltop");
    setAddress("");
    setCaretakerName("");
    setCaretakerPhone("");
    setLodgePresidentName("");
    setLodgePresidentPhone("");
    setShopOwnerContact("");
    setIsVacantNow(true);
    setVacancyCount(1);
    setExpectedVacancyDate("Immediate");
    setHasFinalYearStudents(false);
    setFinalYearDetails("");
    setRentPerSession("₦250,000 / year");
    setWaterReliability("Reliable Borehole");
    setLightReliability("Regular Grid");
    setRoomTypes("Self-contain");
    setSecurityFeatures("Compound gate with night lock, fenced premises");
    setIsLodgeModalOpen(true);
  };

  // Open Lodge Modal for Edit
  const handleOpenEditLodge = (lodge: LodgeAsset) => {
    setEditingLodgeId(lodge.id);
    setLodgeName(lodge.name);
    setArea(lodge.area);
    setAddress(lodge.address);
    setCaretakerName(lodge.caretaker_name);
    setCaretakerPhone(lodge.caretaker_phone);
    setLodgePresidentName(lodge.lodge_president_name || "");
    setLodgePresidentPhone(lodge.lodge_president_phone || "");
    setShopOwnerContact(lodge.shop_owner_contact || "");
    setIsVacantNow(lodge.is_vacant_now);
    setVacancyCount(lodge.vacancy_count);
    setExpectedVacancyDate(lodge.expected_vacancy_date || "Immediate");
    setHasFinalYearStudents(lodge.has_final_year_students);
    setFinalYearDetails(lodge.final_year_details || "");
    setRentPerSession(lodge.rent_per_session);
    setWaterReliability(lodge.water_reliability);
    setLightReliability(lodge.light_reliability);
    setRoomTypes(lodge.room_types);
    setSecurityFeatures(lodge.security_features);
    setIsLodgeModalOpen(true);
  };

  // Submit Lodge (Add or Edit)
  const handleSaveLodge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lodgeName.trim() || !caretakerPhone.trim()) {
      alert("Please enter the lodge name and caretaker phone number.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingLodgeId) {
        // Edit existing lodge
        const updated = await updateLodgeAsset(editingLodgeId, {
          name: lodgeName.trim(),
          area,
          address: address.trim() || `${area}, University Vicinity`,
          caretaker_name: caretakerName.trim() || "Caretaker",
          caretaker_phone: caretakerPhone.trim(),
          lodge_president_name: lodgePresidentName.trim() || undefined,
          lodge_president_phone: lodgePresidentPhone.trim() || undefined,
          shop_owner_contact: shopOwnerContact.trim() || undefined,
          is_vacant_now: isVacantNow,
          vacancy_count: Number(vacancyCount),
          expected_vacancy_date: expectedVacancyDate.trim() || undefined,
          has_final_year_students: hasFinalYearStudents,
          final_year_details: finalYearDetails.trim() || undefined,
          room_types: roomTypes.trim() || "Self-contain",
          rent_per_session: rentPerSession.trim(),
          water_reliability: waterReliability,
          light_reliability: lightReliability,
          security_features: securityFeatures.trim() || "Perimeter gate",
        });

        setLodges((prev) => prev.map((l) => (l.id === editingLodgeId ? updated : l)));
        setNotification(`Lodge "${updated.name}" updated successfully!`);
      } else {
        // Create new lodge
        const newLodge = await createLodge({
          name: lodgeName.trim(),
          area,
          address: address.trim() || `${area}, University Vicinity`,
          caretaker_name: caretakerName.trim() || "Caretaker",
          caretaker_phone: caretakerPhone.trim(),
          lodge_president_name: lodgePresidentName.trim() || undefined,
          lodge_president_phone: lodgePresidentPhone.trim() || undefined,
          shop_owner_contact: shopOwnerContact.trim() || undefined,
          is_vacant_now: isVacantNow,
          vacancy_count: Number(vacancyCount),
          expected_vacancy_date: expectedVacancyDate.trim() || undefined,
          has_final_year_students: hasFinalYearStudents,
          final_year_details: finalYearDetails.trim() || undefined,
          room_types: roomTypes.trim() || "Self-contain",
          rent_per_session: rentPerSession.trim(),
          water_reliability: waterReliability,
          light_reliability: lightReliability,
          security_features: securityFeatures.trim() || "Compound gate with night lock, fenced premises",
          is_verified: false,
          recorded_by_id: currentUser?.id || "u-okonkwo",
          recorded_by_name: currentUser?.name || "Okonkwo Chukwuma",
        });

        setLodges([newLodge, ...lodges]);
        setNotification(`Lodge "${newLodge.name}" recorded in field database!`);

        // Increment scout task
        const scoutTask = tasks.find((t) => t.title.includes("Territory Recon"));
        if (scoutTask) {
          const updated = await incrementTaskProgress(scoutTask.id, 1);
          setTasks((prev) => prev.map((t) => (t.id === scoutTask.id ? updated : t)));
        }
      }

      setIsLodgeModalOpen(false);
      setEditingLodgeId(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Lodge
  const handleDeleteLodge = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active database?`)) return;
    try {
      await deleteLodgeAsset(id);
      setLodges((prev) => prev.filter((l) => l.id !== id));
      setNotification(`Lodge "${name}" removed from registry.`);
    } catch (err: any) {
      alert("Error deleting lodge: " + err.message);
    }
  };

  // Open Student Modal for Add
  const handleOpenAddStudent = (type: StudentIntelType = "final_year") => {
    setEditingStudentId(null);
    setStudentType(type);
    setStudentName("");
    setStudentPhone("");
    setStudentLodgeName(lodges[0]?.name || "Peace Haven Lodge");
    setStudentArea(lodges[0]?.area || "Hilltop");
    setStudentRoomNumber("");
    setStudentExpectedMoveDate(type === "final_year" ? "July 2026 (End of Exams)" : "Next Session");
    setStudentRoomOpeningUp(true);
    setStudentItemsForSale("");
    setStudentReasonForMoving("");
    setStudentPreferredNewArea("Hilltop");
    setStudentTargetBudget("₦250,000 - ₦300,000");
    setStudentDesiredRoomType("Self-contain with reliable water");
    setStudentNotes("");
    setIsStudentModalOpen(true);
  };

  // Open Student Modal for Edit
  const handleOpenEditStudent = (record: StudentIntelRecord) => {
    setEditingStudentId(record.id);
    setStudentType(record.student_type);
    setStudentName(record.student_name);
    setStudentPhone(record.phone);
    setStudentLodgeName(record.current_lodge_name);
    setStudentArea(record.area);
    setStudentRoomNumber(record.room_number_or_type);
    setStudentExpectedMoveDate(record.expected_move_date);
    setStudentRoomOpeningUp(record.room_opening_up ?? true);
    setStudentItemsForSale(record.items_for_sale || "");
    setStudentReasonForMoving(record.reason_for_moving || "");
    setStudentPreferredNewArea(record.preferred_new_area || "Hilltop");
    setStudentTargetBudget(record.target_budget || "₦250,000 - ₦300,000");
    setStudentDesiredRoomType(record.desired_new_room_type || "Self-contain");
    setStudentNotes(record.notes || "");
    setIsStudentModalOpen(true);
  };

  // Submit Student Intel (Add or Edit)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim() || !studentLodgeName.trim()) {
      alert("Please fill student name, phone number, and current lodge.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudentId) {
        const updated = await updateStudentIntelRecord(editingStudentId, {
          student_type: studentType,
          student_name: studentName.trim(),
          phone: studentPhone.trim(),
          current_lodge_name: studentLodgeName.trim(),
          area: studentArea,
          room_number_or_type: studentRoomNumber.trim() || "Room (Unspecified)",
          expected_move_date: studentExpectedMoveDate.trim(),
          room_opening_up: studentType === "final_year" ? studentRoomOpeningUp : undefined,
          items_for_sale: studentType === "final_year" ? studentItemsForSale.trim() || undefined : undefined,
          reason_for_moving: studentType === "transition" ? studentReasonForMoving.trim() || undefined : undefined,
          preferred_new_area: studentType === "transition" ? studentPreferredNewArea : undefined,
          target_budget: studentType === "transition" ? studentTargetBudget.trim() || undefined : undefined,
          desired_new_room_type: studentType === "transition" ? studentDesiredRoomType.trim() || undefined : undefined,
          notes: studentNotes.trim() || undefined,
        });

        setStudents((prev) => prev.map((s) => (s.id === editingStudentId ? updated : s)));
        setNotification(`Record for ${updated.student_name} updated successfully!`);
      } else {
        const newRecord = await createStudentIntelRecord({
          student_type: studentType,
          student_name: studentName.trim(),
          phone: studentPhone.trim(),
          current_lodge_name: studentLodgeName.trim(),
          area: studentArea,
          room_number_or_type: studentRoomNumber.trim() || "Room (Unspecified)",
          expected_move_date: studentExpectedMoveDate.trim(),
          room_opening_up: studentType === "final_year" ? studentRoomOpeningUp : undefined,
          items_for_sale: studentType === "final_year" ? studentItemsForSale.trim() || undefined : undefined,
          reason_for_moving: studentType === "transition" ? studentReasonForMoving.trim() || undefined : undefined,
          preferred_new_area: studentType === "transition" ? studentPreferredNewArea : undefined,
          target_budget: studentType === "transition" ? studentTargetBudget.trim() || undefined : undefined,
          desired_new_room_type: studentType === "transition" ? studentDesiredRoomType.trim() || undefined : undefined,
          notes: studentNotes.trim() || undefined,
          recorded_by_id: currentUser?.id || "u-okonkwo",
          recorded_by_name: currentUser?.name || "Okonkwo Chukwuma",
        });

        setStudents([newRecord, ...students]);
        setNotification(`${studentType === "final_year" ? "Graduating student" : "Transition student"} "${newRecord.student_name}" logged!`);

        // Increment Intel task if present
        const intelTask = tasks.find((t) => t.title.includes("Database Capture") || t.title.includes("Intel"));
        if (intelTask) {
          const updated = await incrementTaskProgress(intelTask.id, 1);
          setTasks((prev) => prev.map((t) => (t.id === intelTask.id ? updated : t)));
        }
      }

      setIsStudentModalOpen(false);
      setEditingStudentId(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Student Intel
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the student intel record for "${name}"?`)) return;
    try {
      await deleteStudentIntelRecord(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setNotification(`Intel record for "${name}" removed.`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Submit Agency Application
  const handleCreateAgencyApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appLodgeName.trim() || !appCaretakerPhone.trim()) {
      alert("Please provide the lodge name and caretaker phone.");
      return;
    }

    setSubmitting(true);
    try {
      const newApp = await createLodgeApplication({
        lodge_name: appLodgeName.trim(),
        area: appArea,
        caretaker_name: appCaretakerName.trim() || "Caretaker",
        caretaker_phone: appCaretakerPhone.trim(),
        controller_id: currentUser?.id || "u-okonkwo",
        controller_name: currentUser?.name || "Okonkwo Chukwuma",
        commission_terms: appTerms.trim(),
        status: "applied",
        notes: appNotes.trim() || undefined,
      });

      setApplications([newApp, ...applications]);
      setNotification(`Agency application submitted for "${newApp.lodge_name}"!`);
      setIsAgencyModalOpen(false);

      const agencyTask = tasks.find((t) => t.title.includes("Agency Application"));
      if (agencyTask) {
        const updated = await incrementTaskProgress(agencyTask.id, 1);
        setTasks((prev) => prev.map((t) => (t.id === agencyTask.id ? updated : t)));
      }

      setAppLodgeName("");
      setAppCaretakerName("");
      setAppCaretakerPhone("");
      setAppNotes("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Lodges
  const filteredLodges = lodges.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase()) ||
      l.caretaker_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.lodge_president_name && l.lodge_president_name.toLowerCase().includes(search.toLowerCase()));
    const matchVacancy = filterVacancyOnly ? l.is_vacant_now && l.vacancy_count > 0 : true;
    const matchFinalYear = filterFinalYearOnly ? l.has_final_year_students : true;
    return matchSearch && matchVacancy && matchFinalYear;
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchType = studentFilter === "all" || s.student_type === studentFilter;
    const matchSearch =
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.current_lodge_name.toLowerCase().includes(search.toLowerCase()) ||
      s.area.toLowerCase().includes(search.toLowerCase()) ||
      (s.items_for_sale && s.items_for_sale.toLowerCase().includes(search.toLowerCase())) ||
      (s.reason_for_moving && s.reason_for_moving.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const completedTasksCount = tasks.filter((t) => t.is_completed).length;
  const taskProgressPct = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const activeZone = zones.find((z) => z.name === "Hilltop") || zones[0];

  // Dynamic ground-truth counts
  const finalYearCount = students.filter((s) => s.student_type === "final_year").length;
  const transitionCount = students.filter((s) => s.student_type === "transition").length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
        <AccommodationNav />
        <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-xs">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Staff Authentication Required
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in with your staff account to access the Area Controller workspace.
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
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Account Pending Admin Assignment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hello {currentUser.name}, your account is currently pending Admin (Okoye) approval and territory assignment.
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

        {/* WORKER PERSONA HEADER & ACTION BAR */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-emerald-500/30 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-black uppercase tracking-widest text-emerald-400">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  Area Controller Workspace
                </div>
                <span className="text-xs font-mono text-neutral-300 bg-neutral-950 px-2.5 py-0.5 rounded-full border border-neutral-800">
                  Assigned Territory: {activeZone?.name || "Hilltop"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Ground Field Reconnaissance
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Log and manage physical lodges, capture caretaker contacts, track vacating final-year students with rooms to release, and register transition students moving between hostels.
              </p>
            </div>

            {/* Quick Field Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenAddLodge}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Lodge</span>
              </button>

              <button
                onClick={() => handleOpenAddStudent("final_year")}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Log Student Intel</span>
              </button>

              <button
                onClick={() => setIsAgencyModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs border border-neutral-700 transition-all cursor-pointer"
              >
                <Handshake className="w-4 h-4 text-emerald-400" />
                <span>Agency App</span>
              </button>

              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs border border-neutral-700 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>Inspection Guide</span>
              </button>
            </div>
          </div>

          {/* Active Worker Context Strip */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-medium">Logged in Controller:</span>
              <strong className="text-white font-bold">{currentUser?.name || "Staff Controller"}</strong>
              {currentUser?.phone && (
                <span className="text-neutral-400 font-mono">({currentUser.phone})</span>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Assigned Field Terminal</span>
            </div>
          </div>
        </div>

        {/* 4 DYNAMIC GROUND-TRUTH RECORDING METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Lodges Mapped</span>
              <Building className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{lodges.length}</div>
            <p className="text-[11px] text-neutral-400">
              {lodges.reduce((sum, l) => sum + (l.is_vacant_now ? l.vacancy_count : 0), 0)} vacant rooms identified
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Final-Year Students</span>
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{finalYearCount}</div>
            <p className="text-[11px] text-neutral-400">Graduating & vacating rooms tracked</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Transition Students</span>
              <MoveRight className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{transitionCount}</div>
            <p className="text-[11px] text-neutral-400">Changing hostels next session</p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Agency Agreements</span>
              <Handshake className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{applications.length}</div>
            <p className="text-[11px] text-neutral-400">Official caretaker partnerships</p>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("missions")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "missions"
                    ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Today&apos;s Duties ({tasks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("lodges")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "lodges"
                    ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Scouted Lodges ({lodges.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "students"
                    ? "bg-amber-400 text-neutral-950 font-extrabold shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Final-Year & Transition ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("agency")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "agency"
                    ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Agency Agreements ({applications.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("territory")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "territory"
                    ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Territory Zones ({zones.length})</span>
              </button>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono text-right">
              {activeTab === "lodges" && `${filteredLodges.length} lodges matched`}
              {activeTab === "students" && `${filteredStudents.length} student records`}
              {activeTab === "missions" && `${completedTasksCount} / ${tasks.length} duties complete`}
            </div>
          </div>

          {/* Search bar for Lodges Tab */}
          {activeTab === "lodges" && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lodge name, caretaker, president, or area..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilterVacancyOnly(!filterVacancyOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterVacancyOnly
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Vacancies Only
                </button>
                <button
                  onClick={() => setFilterFinalYearOnly(!filterFinalYearOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterFinalYearOnly
                      ? "bg-amber-400 text-neutral-950"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Final-Year Intel
                </button>
              </div>
            </div>
          )}

          {/* Search & Filters for Students Tab */}
          {activeTab === "students" && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student name, phone, lodge, items for sale, or relocation reason..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setStudentFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    studentFilter === "all" ? "bg-amber-400 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStudentFilter("final_year")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    studentFilter === "final_year" ? "bg-amber-400 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Final-Year Graduating ({finalYearCount})
                </button>
                <button
                  onClick={() => setStudentFilter("transition")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    studentFilter === "transition" ? "bg-blue-400 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Transition Moving ({transitionCount})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: TODAY'S FIELD MISSIONS & AUTO-PACER */}
        {/* ============================================================== */}
        {activeTab === "missions" && (
          <div className="space-y-4">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Today&apos;s Field Mission Progress
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Real-time execution paced by the KINGSOK System to conquer your assigned territory.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {taskProgressPct}%
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-bold uppercase">Completion</span>
                </div>
              </div>

              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${taskProgressPct}%` }}
                />
              </div>
            </div>

            {/* Quests List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`bg-neutral-900 rounded-2xl border p-5 shadow-sm space-y-3 cursor-pointer transition-all hover:border-neutral-700 ${
                    task.is_completed ? "border-emerald-500/40 bg-emerald-950/20" : "border-neutral-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {task.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-600 hover:text-emerald-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-black text-sm ${
                              task.is_completed ? "text-emerald-300 line-through" : "text-white"
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.assigned_by === "admin" ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                              Directive from Okoye
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                              System Paced
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                          {task.description}
                        </p>

                        {task.admin_note && (
                          <div className="mt-2 text-xs text-amber-300 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20 font-semibold">
                            Note: {task.admin_note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black font-mono text-white">
                        {task.completed_count} / {task.target_count}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                        {task.unit_label}
                      </span>

                      {!task.is_completed && (
                        <button
                          onClick={(e) => handleIncrementTask(task.id, e)}
                          className="mt-2 text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          +1 Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SCOUTED LODGES & INTEL DIRECTORY */}
        {/* ============================================================== */}
        {activeTab === "lodges" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLodges.map((lodge) => (
                <div
                  key={lodge.id}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-white text-base">
                          {lodge.name}
                        </h3>
                        <span className="text-xs text-neutral-400 font-medium block mt-0.5">
                          {lodge.area} &bull; {lodge.address}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-500/30 block">
                          {lodge.rent_per_session}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          {lodge.is_vacant_now ? `${lodge.vacancy_count} rooms vacant now` : "Currently fully occupied"}
                        </span>
                      </div>
                    </div>

                    {/* Utilities & Room Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-neutral-400 font-semibold text-[11px]">
                          <Droplets className="w-3.5 h-3.5 text-blue-400" />
                          <span>Water Reality</span>
                        </div>
                        <div className="font-bold text-white">{lodge.water_reliability}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-neutral-400 font-semibold text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Power Reality</span>
                        </div>
                        <div className="font-bold text-white">{lodge.light_reliability}</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Room Types:</span>
                        <span className="font-semibold text-white">{lodge.room_types}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Security:</span>
                        <span className="font-semibold text-white truncate max-w-[200px]">{lodge.security_features}</span>
                      </div>
                    </div>

                    {/* Contacts & Intel */}
                    <div className="space-y-1.5 text-xs bg-neutral-950/90 p-3 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Caretaker:</span>
                        <a
                          href={`tel:${lodge.caretaker_phone}`}
                          className="font-bold text-emerald-400 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {lodge.caretaker_name} ({lodge.caretaker_phone})
                        </a>
                      </div>

                      {lodge.lodge_president_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Lodge President:</span>
                          <a
                            href={`tel:${lodge.lodge_president_phone}`}
                            className="font-semibold text-neutral-200 flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {lodge.lodge_president_name} ({lodge.lodge_president_phone})
                          </a>
                        </div>
                      )}

                      {lodge.shop_owner_contact && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Shop Contact:</span>
                          <span className="text-neutral-300 font-medium">{lodge.shop_owner_contact}</span>
                        </div>
                      )}

                      {lodge.has_final_year_students && lodge.final_year_details && (
                        <div className="pt-1.5 border-t border-neutral-800 text-[11px] text-amber-300 bg-amber-400/10 p-2 rounded-lg">
                          <span className="font-bold flex items-center gap-1 text-amber-400">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                            Final-Year Intel:
                          </span>
                          <p className="mt-0.5">{lodge.final_year_details}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-800">
                    <span>Scouted by: {lodge.recorded_by_name}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditLodge(lodge)}
                        className="text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-emerald-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteLodge(lodge.id, lodge.name)}
                        className="text-xs font-bold text-neutral-400 hover:text-rose-400 flex items-center gap-1 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                        title="Delete Lodge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setAppLodgeName(lodge.name);
                          setAppArea(lodge.area);
                          setAppCaretakerName(lodge.caretaker_name);
                          setAppCaretakerPhone(lodge.caretaker_phone);
                          setIsAgencyModalOpen(true);
                        }}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 transition-colors"
                      >
                        <Handshake className="w-3 h-3" />
                        <span>Agency</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLodges.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-2">
                  <Building className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No lodges match your search criteria.</p>
                  <p className="text-xs text-neutral-500">Click &quot;Log Lodge&quot; above to add verified ground reconnaissance records.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FINAL-YEAR & TRANSITION STUDENTS */}
        {/* ============================================================== */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs">
              <span className="font-black uppercase tracking-wider text-[11px] text-neutral-400">
                Ground Intel Directory: Vacating Graduates & Moving Students
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddStudent("final_year")}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-lg transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Final-Year Student</span>
                </button>
                <button
                  onClick={() => handleOpenAddStudent("transition")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Transition Student</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((record) => {
                const isFinalYear = record.student_type === "final_year";
                return (
                  <div
                    key={record.id}
                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-white text-base">
                              {record.student_name}
                            </h3>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isFinalYear
                                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                                  : "bg-blue-950 text-blue-300 border-blue-500/40"
                              }`}
                            >
                              {isFinalYear ? "Graduating / Vacating" : "Transition Moving"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={`tel:${record.phone}`}
                              className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {record.phone}
                            </a>
                            <span className="text-neutral-500">&bull;</span>
                            <span className="text-xs text-neutral-300">{record.current_lodge_name}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-neutral-400 block font-mono">
                            {record.area}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                            Move Date: {record.expected_move_date}
                          </span>
                        </div>
                      </div>

                      {/* Final-Year Specific Highlights */}
                      {isFinalYear ? (
                        <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Room Status:</span>
                            <span className="font-bold text-emerald-400">
                              {record.room_opening_up ? "Room opening up for incoming freshers" : "Room staying retained"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Room Number / Type:</span>
                            <span className="font-semibold text-white">{record.room_number_or_type}</span>
                          </div>
                          {record.items_for_sale && (
                            <div className="pt-2 border-t border-neutral-800/80">
                              <span className="text-[10px] font-bold uppercase text-amber-400 block flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-400" />
                                Household Items / Properties for Sale:
                              </span>
                              <p className="text-neutral-200 mt-0.5 leading-snug">{record.items_for_sale}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Transition Student Highlights */
                        <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Reason for Moving:</span>
                            <p className="text-neutral-200 font-medium">{record.reason_for_moving || "Seeking better accommodation"}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-neutral-500 block">Preferred Area:</span>
                              <span className="font-semibold text-white">{record.preferred_new_area || record.area}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase text-neutral-500 block">Target Budget:</span>
                              <span className="font-semibold text-emerald-400 font-mono">{record.target_budget || "Standard"}</span>
                            </div>
                          </div>
                          {record.desired_new_room_type && (
                            <div>
                              <span className="text-[10px] font-bold uppercase text-neutral-500 block">Desired Room Type:</span>
                              <span className="font-semibold text-white">{record.desired_new_room_type}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {record.notes && (
                        <p className="text-xs text-neutral-400 italic bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/60">
                          &ldquo;{record.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                      <span>Logged by: {record.recorded_by_name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditStudent(record)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(record.id, record.student_name)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-2">
                  <GraduationCap className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No student intel records found matching filters.</p>
                  <p className="text-xs text-neutral-500">Capture final-year vacating students and transition students to secure rooms early.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AGENCY APPLICATIONS */}
        {/* ============================================================== */}
        {activeTab === "agency" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
                Official Agency Representation Agreements
              </span>
              <span>Signed agreements make KINGSOK the exclusive lodge agent</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-white text-base">
                        {app.lodge_name}
                      </h4>
                      <span className="text-xs text-neutral-400">{app.area}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        app.status === "accepted"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : app.status === "in_discussion"
                          ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                          : "bg-neutral-800 text-neutral-300 border-neutral-700"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase font-bold">Caretaker Contact:</span>
                      <div className="font-bold text-white">{app.caretaker_name} ({app.caretaker_phone})</div>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase font-bold">Proposed Terms:</span>
                      <div className="text-neutral-300">{app.commission_terms}</div>
                    </div>
                    {app.notes && (
                      <div className="text-emerald-400 font-medium pt-1">
                        &ldquo;{app.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-800">
                    Handled by: {app.controller_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: TERRITORY ZONES */}
        {/* ============================================================== */}
        {activeTab === "territory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
                Territory Coverage & Lodge Conquest
              </span>
              <span>Pacing across university neighborhoods</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((z) => {
                const coveredPct = Math.round((z.lodges_scouted / z.estimated_total_lodges) * 100);
                return (
                  <div
                    key={z.id}
                    className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-extrabold text-white text-sm">
                          {z.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {coveredPct}% Mapped
                      </span>
                    </div>

                    <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${coveredPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Target</span>
                        <span className="font-black text-white">{z.estimated_total_lodges}</span>
                      </div>
                      <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Scouted</span>
                        <span className="font-black text-emerald-400">{z.lodges_scouted}</span>
                      </div>
                      <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Agencies</span>
                        <span className="font-black text-purple-400">{z.agency_agreements_won}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-800">
                      Lead Controller: <strong>{z.assigned_controller_name}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: LODGE & MANAGEMENT MODAL (ADD & EDIT) */}
        {/* ============================================================== */}
        {isLodgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      {editingLodgeId ? "Edit Lodge Record" : "Record Lodge Recon"}
                    </h3>
                    <p className="text-[11px] text-neutral-400">Capture caretaker, president, utilities, and vacancy reality</p>
                  </div>
                </div>
                <button onClick={() => setIsLodgeModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLodge} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Lodge Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lodgeName}
                    onChange={(e) => setLodgeName(e.target.value)}
                    placeholder="e.g. Royal Grace Lodge"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500 outline-none font-semibold text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Assigned Zone *
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:border-emerald-500 outline-none font-semibold text-white"
                    >
                      {NSUKKA_CAMPUS_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Rent Per Session *
                    </label>
                    <input
                      type="text"
                      required
                      value={rentPerSession}
                      onChange={(e) => setRentPerSession(e.target.value)}
                      placeholder="e.g. ₦250,000 / year"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono font-bold text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Physical Address & Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14 University Road, behind Faculty of Engineering"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Caretaker, President & Shop Contact */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <span className="font-bold text-white block text-xs">Lodge Contacts & Key Intel</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Caretaker Name
                      </label>
                      <input
                        type="text"
                        value={caretakerName}
                        onChange={(e) => setCaretakerName(e.target.value)}
                        placeholder="Mr. Boniface"
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Caretaker Phone *
                      </label>
                      <input
                        type="text"
                        required
                        value={caretakerPhone}
                        onChange={(e) => setCaretakerPhone(e.target.value)}
                        placeholder="+234 803..."
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Lodge President Name
                      </label>
                      <input
                        type="text"
                        value={lodgePresidentName}
                        onChange={(e) => setLodgePresidentName(e.target.value)}
                        placeholder="Chukwudi"
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        Lodge President Phone
                      </label>
                      <input
                        type="text"
                        value={lodgePresidentPhone}
                        onChange={(e) => setLodgePresidentPhone(e.target.value)}
                        placeholder="+234 812..."
                        className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                      Nearby Shop Owner / Ground Contact
                    </label>
                    <input
                      type="text"
                      value={shopOwnerContact}
                      onChange={(e) => setShopOwnerContact(e.target.value)}
                      placeholder="e.g. Mama Joy Provisions (+234 802 111 0000)"
                      className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Vacancy Details */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Vacant Now?</span>
                    <button
                      type="button"
                      onClick={() => setIsVacantNow(!isVacantNow)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                        isVacantNow ? "bg-emerald-600 text-white" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {isVacantNow ? "YES (Vacant)" : "NO (Full)"}
                    </button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Vacancy Count</label>
                    <input
                      type="number"
                      min={0}
                      value={vacancyCount}
                      onChange={(e) => setVacancyCount(Number(e.target.value))}
                      className="w-full p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Expected Vacancy</label>
                    <input
                      type="text"
                      value={expectedVacancyDate}
                      onChange={(e) => setExpectedVacancyDate(e.target.value)}
                      placeholder="Immediate"
                      className="w-full p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Room Types & Security Features */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Room Types Available
                    </label>
                    <input
                      type="text"
                      value={roomTypes}
                      onChange={(e) => setRoomTypes(e.target.value)}
                      placeholder="e.g. Self-contain, Single Room, 2-Bedroom"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Security Features
                    </label>
                    <input
                      type="text"
                      value={securityFeatures}
                      onChange={(e) => setSecurityFeatures(e.target.value)}
                      placeholder="e.g. Compound gate, night watchman, fence"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Water & Power Reality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Water Reality *
                    </label>
                    <select
                      value={waterReliability}
                      onChange={(e) => setWaterReliability(e.target.value as any)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-semibold text-white"
                    >
                      <option value="Reliable Borehole">Reliable Borehole</option>
                      <option value="Occasional">Occasional Tap</option>
                      <option value="Public Tap Only">Public Tap Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Power Reality *
                    </label>
                    <select
                      value={lightReliability}
                      onChange={(e) => setLightReliability(e.target.value as any)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-semibold text-white"
                    >
                      <option value="Regular Grid">Regular Grid</option>
                      <option value="Generator Supported">Generator Supported</option>
                      <option value="Poor">Poor Supply</option>
                    </select>
                  </div>
                </div>

                {/* Final-Year Student Intel Callout */}
                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      Graduating Final-Year Residents In This Lodge
                    </span>
                    <input
                      type="checkbox"
                      checked={hasFinalYearStudents}
                      onChange={(e) => setHasFinalYearStudents(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                  </div>

                  {hasFinalYearStudents && (
                    <input
                      type="text"
                      value={finalYearDetails}
                      onChange={(e) => setFinalYearDetails(e.target.value)}
                      placeholder="e.g. 2 students graduating in July. Selling mini fridge & mattress."
                      className="w-full p-2 bg-neutral-950 border border-amber-400/40 rounded-lg text-xs text-white"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsLodgeModalOpen(false)}
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
                    <span>{submitting ? "Saving..." : editingLodgeId ? "Update Lodge" : "Save Lodge Intel"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: FINAL-YEAR & TRANSITION STUDENT MODAL (ADD & EDIT) */}
        {/* ============================================================== */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      {editingStudentId ? "Edit Student Intel Record" : "Capture Student Relocation / Vacancy Intel"}
                    </h3>
                    <p className="text-[11px] text-neutral-400">Lock down vacating rooms and assist moving students</p>
                  </div>
                </div>
                <button onClick={() => setIsStudentModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStudentType("final_year")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    studentType === "final_year"
                      ? "bg-amber-400 text-neutral-950 shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Final-Year (Graduating & Vacating)
                </button>

                <button
                  type="button"
                  onClick={() => setStudentType("transition")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    studentType === "transition"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Transition (Looking to Move)
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Chinedu Eze"
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
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Current Lodge Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentLodgeName}
                      onChange={(e) => setStudentLodgeName(e.target.value)}
                      placeholder="e.g. Peace Haven Lodge"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Territory Zone *
                    </label>
                    <select
                      value={studentArea}
                      onChange={(e) => setStudentArea(e.target.value)}
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    >
                      {NSUKKA_CAMPUS_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Room Number / Type
                    </label>
                    <input
                      type="text"
                      value={studentRoomNumber}
                      onChange={(e) => setStudentRoomNumber(e.target.value)}
                      placeholder="e.g. Room 14 (Self-contain)"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Expected Move Date
                    </label>
                    <input
                      type="text"
                      value={studentExpectedMoveDate}
                      onChange={(e) => setStudentExpectedMoveDate(e.target.value)}
                      placeholder="e.g. July 2026 or Next Session"
                      className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Final-Year Specific Form Fields */}
                {studentType === "final_year" ? (
                  <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-xs">Room Opening Up For Freshers?</span>
                      <button
                        type="button"
                        onClick={() => setStudentRoomOpeningUp(!studentRoomOpeningUp)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          studentRoomOpeningUp ? "bg-amber-400 text-neutral-950" : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {studentRoomOpeningUp ? "YES (Will Be Vacant)" : "NO"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-amber-400 mb-1">
                        Items / Properties To Sell Or Hand Over
                      </label>
                      <textarea
                        rows={2}
                        value={studentItemsForSale}
                        onChange={(e) => setStudentItemsForSale(e.target.value)}
                        placeholder="e.g. Bed frame, mattress, 6kg gas cylinder, table fridge..."
                        className="w-full p-2 bg-neutral-950 border border-amber-400/40 rounded-lg text-white"
                      />
                    </div>
                  </div>
                ) : (
                  /* Transition Student Specific Form Fields */
                  <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-blue-300 mb-1">
                        Reason For Moving Away From Current Lodge
                      </label>
                      <input
                        type="text"
                        value={studentReasonForMoving}
                        onChange={(e) => setStudentReasonForMoving(e.target.value)}
                        placeholder="e.g. Irregular water supply, noisy compound, far from faculty"
                        className="w-full p-2 bg-neutral-950 border border-blue-500/40 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-blue-300 mb-1">
                          Preferred New Area
                        </label>
                        <select
                          value={studentPreferredNewArea}
                          onChange={(e) => setStudentPreferredNewArea(e.target.value)}
                          className="w-full p-2 bg-neutral-950 border border-blue-500/40 rounded-lg text-white font-semibold"
                        >
                          {NSUKKA_CAMPUS_AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-blue-300 mb-1">
                          Target Budget
                        </label>
                        <input
                          type="text"
                          value={studentTargetBudget}
                          onChange={(e) => setStudentTargetBudget(e.target.value)}
                          placeholder="e.g. ₦250,000 - ₦300,000"
                          className="w-full p-2 bg-neutral-950 border border-blue-500/40 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-blue-300 mb-1">
                        Desired Room Type
                      </label>
                      <input
                        type="text"
                        value={studentDesiredRoomType}
                        onChange={(e) => setStudentDesiredRoomType(e.target.value)}
                        placeholder="e.g. Self-contain with steady borehole water"
                        className="w-full p-2 bg-neutral-950 border border-blue-500/40 rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Special Controller Notes
                  </label>
                  <textarea
                    rows={2}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    placeholder="e.g. Ready for physical inspection this weekend; room in great shape..."
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
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
                    <span>{submitting ? "Saving..." : editingStudentId ? "Update Student Intel" : "Save Student Intel"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: SUBMIT LODGE AGENCY APPLICATION */}
        {/* ============================================================== */}
        {isAgencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-700 space-y-4 text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      Submit Agency Representation
                    </h3>
                    <p className="text-[11px] text-neutral-400">Apply to become official lodge agent</p>
                  </div>
                </div>
                <button onClick={() => setIsAgencyModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAgencyApp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Lodge Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appLodgeName}
                    onChange={(e) => setAppLodgeName(e.target.value)}
                    placeholder="e.g. Peace Haven Lodge"
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Caretaker Name
                    </label>
                    <input
                      type="text"
                      value={appCaretakerName}
                      onChange={(e) => setAppCaretakerName(e.target.value)}
                      placeholder="Elder Samuel"
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                      Caretaker Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={appCaretakerPhone}
                      onChange={(e) => setAppCaretakerPhone(e.target.value)}
                      placeholder="+234 803..."
                      className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Commission & Value Proposition *
                  </label>
                  <input
                    type="text"
                    required
                    value={appTerms}
                    onChange={(e) => setAppTerms(e.target.value)}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                    Discussion Notes
                  </label>
                  <textarea
                    rows={2}
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="e.g. Caretaker agreed to keep 2 rooms exclusively for KINGSOK freshers..."
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsAgencyModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-xs disabled:opacity-50"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Save Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 4: CLIENT APPROACH & INSPECTION ETIQUETTE GUIDE */}
        {/* ============================================================== */}
        {isGuideModalOpen && guide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-700 space-y-4 max-h-[90vh] overflow-y-auto text-neutral-100">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      {guide.title}
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-semibold">{guide.core_rule}</p>
                  </div>
                </div>
                <button onClick={() => setIsGuideModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {guide.rules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white text-xs">
                        {rule.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        {rule.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rule.instruction}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setIsGuideModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
                >
                  Understood & Ready
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
