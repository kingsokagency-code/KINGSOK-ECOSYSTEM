"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getLodges,
  createLodge,
  updateLodgeAsset,
  deleteLodgeAsset,
  getCurrentUser,
  NSUKKA_CAMPUS_AREAS,
  LodgeAsset,
  UserProfile,
} from "@/lib/accommodation-service";
import {
  Building,
  PlusCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Droplets,
  Zap,
  Shield,
  MapPin,
  Edit2,
  Trash2,
  X,
  MessageCircle,
  RefreshCw,
  Home,
  Check,
} from "lucide-react";

export default function AreaControllerWorkspace() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lodges, setLodges] = useState<LodgeAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterVacancy, setFilterVacancy] = useState<"all" | "vacant_only" | "occupied_only">("all");
  const [filterArea, setFilterArea] = useState<string>("all");

  // Toast Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [editingLodgeId, setEditingLodgeId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lodge Form Fields
  const [lodgeName, setLodgeName] = useState("");
  const [area, setArea] = useState("Hilltop");
  const [address, setAddress] = useState("");
  const [caretakerName, setCaretakerName] = useState("");
  const [caretakerPhone, setCaretakerPhone] = useState("");
  const [isVacantNow, setIsVacantNow] = useState(true);
  const [vacancyCount, setVacancyCount] = useState(1);
  const [rentPerSession, setRentPerSession] = useState("₦250,000 / year");
  const [waterReliability, setWaterReliability] = useState<"Reliable Borehole" | "Occasional" | "Public Tap Only">("Reliable Borehole");
  const [lightReliability, setLightReliability] = useState<"Regular Grid" | "Generator Supported" | "Poor">("Regular Grid");
  const [roomTypes, setRoomTypes] = useState("Self-contain");
  const [securityFeatures, setSecurityFeatures] = useState("Compound gate with night lock, fenced premises");

  useEffect(() => {
    async function load() {
      try {
        const [cur, lList] = await Promise.all([
          getCurrentUser(),
          getLodges(),
        ]);
        setCurrentUser(cur);
        setLodges(lList);
        if (cur?.zone_preference && NSUKKA_CAMPUS_AREAS.includes(cur.zone_preference as any)) {
          setArea(cur.zone_preference);
        }
      } catch (err) {
        console.error("Failed to load controller data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Modal Open for Add
  const handleOpenAddLodge = () => {
    setEditingLodgeId(null);
    setLodgeName("");
    setArea(currentUser?.zone_preference || "Hilltop");
    setAddress("");
    setCaretakerName("");
    setCaretakerPhone("");
    setIsVacantNow(true);
    setVacancyCount(1);
    setRentPerSession("₦250,000 / year");
    setWaterReliability("Reliable Borehole");
    setLightReliability("Regular Grid");
    setRoomTypes("Self-contain");
    setSecurityFeatures("Compound gate with night lock, fenced premises");
    setIsLodgeModalOpen(true);
  };

  // Modal Open for Edit
  const handleOpenEditLodge = (lodge: LodgeAsset) => {
    setEditingLodgeId(lodge.id);
    setLodgeName(lodge.name);
    setArea(lodge.area);
    setAddress(lodge.address);
    setCaretakerName(lodge.caretaker_name);
    setCaretakerPhone(lodge.caretaker_phone);
    setIsVacantNow(lodge.is_vacant_now);
    setVacancyCount(lodge.vacancy_count);
    setRentPerSession(lodge.rent_per_session);
    setWaterReliability(lodge.water_reliability);
    setLightReliability(lodge.light_reliability);
    setRoomTypes(lodge.room_types);
    setSecurityFeatures(lodge.security_features);
    setIsLodgeModalOpen(true);
  };

  // Save Lodge (Create or Update)
  const handleSaveLodge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lodgeName.trim() || !caretakerPhone.trim()) {
      alert("Please provide the lodge name and caretaker phone number.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingLodgeId) {
        const updated = await updateLodgeAsset(editingLodgeId, {
          name: lodgeName.trim(),
          area,
          address: address.trim() || undefined,
          caretaker_name: caretakerName.trim() || "Caretaker",
          caretaker_phone: caretakerPhone.trim(),
          is_vacant_now: isVacantNow,
          vacancy_count: isVacantNow ? Math.max(1, vacancyCount) : 0,
          rent_per_session: rentPerSession.trim(),
          water_reliability: waterReliability,
          light_reliability: lightReliability,
          room_types: roomTypes.trim() || "Self-contain",
          security_features: securityFeatures.trim(),
        });
        setLodges((prev) => prev.map((l) => (l.id === editingLodgeId ? updated : l)));
        setNotification(`Lodge "${updated.name}" updated successfully!`);
      } else {
        const newLodge = await createLodge({
          name: lodgeName.trim(),
          area,
          address: address.trim() || "Nsukka Campus Territory",
          caretaker_name: caretakerName.trim() || "Caretaker",
          caretaker_phone: caretakerPhone.trim(),
          is_vacant_now: isVacantNow,
          vacancy_count: isVacantNow ? Math.max(1, vacancyCount) : 0,
          rent_per_session: rentPerSession.trim(),
          water_reliability: waterReliability,
          light_reliability: lightReliability,
          room_types: roomTypes.trim() || "Self-contain",
          security_features: securityFeatures.trim() || "Compound gate with night lock, fenced premises",
          has_final_year_students: false,
          is_verified: false,
          recorded_by_id: currentUser?.id || "staff-controller",
          recorded_by_name: currentUser?.name || "Staff Controller",
        });
        setLodges([newLodge, ...lodges]);
        setNotification(`Lodge "${newLodge.name}" registered successfully!`);
      }
      setIsLodgeModalOpen(false);
      setEditingLodgeId(null);
    } catch (err: any) {
      alert("Error saving lodge: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Vacancy Toggle (1-click from card)
  const handleQuickToggleVacancy = async (lodge: LodgeAsset) => {
    const nextVacant = !lodge.is_vacant_now;
    const nextCount = nextVacant ? (lodge.vacancy_count > 0 ? lodge.vacancy_count : 1) : 0;
    try {
      const updated = await updateLodgeAsset(lodge.id, {
        is_vacant_now: nextVacant,
        vacancy_count: nextCount,
      });
      setLodges((prev) => prev.map((l) => (l.id === lodge.id ? updated : l)));
      setNotification(`Availability updated: "${updated.name}" is now marked as ${nextVacant ? `${nextCount} Room(s) Vacant` : "Fully Occupied"}.`);
    } catch (err: any) {
      alert("Error updating vacancy: " + err.message);
    }
  };

  // Delete Lodge
  const handleDeleteLodge = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the system?`)) return;
    try {
      await deleteLodgeAsset(id);
      setLodges((prev) => prev.filter((l) => l.id !== id));
      setNotification(`Lodge "${name}" removed.`);
    } catch (err: any) {
      alert("Error deleting lodge: " + err.message);
    }
  };

  // Filtered Lodges
  const filteredLodges = lodges.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase()) ||
      l.caretaker_name.toLowerCase().includes(search.toLowerCase()) ||
      l.caretaker_phone.includes(search) ||
      (l.address && l.address.toLowerCase().includes(search.toLowerCase()));

    const matchVacancy =
      filterVacancy === "all"
        ? true
        : filterVacancy === "vacant_only"
        ? l.is_vacant_now && l.vacancy_count > 0
        : !l.is_vacant_now || l.vacancy_count === 0;

    const matchArea = filterArea === "all" ? true : l.area === filterArea;

    return matchSearch && matchVacancy && matchArea;
  });

  const totalVacantRooms = lodges.reduce(
    (sum, l) => sum + (l.is_vacant_now ? l.vacancy_count : 0),
    0
  );
  const totalOccupiedLodges = lodges.filter(
    (l) => !l.is_vacant_now || l.vacancy_count === 0
  ).length;

  // Unauthenticated screen
  if (!loading && !currentUser) {
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
                Staff Sign In Required
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please sign in with your staff account to access the Area Controller workspace.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login?portal=staff"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block text-center"
              >
                Sign In as Staff
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pending Approval screen with 1-tap live status check
  if (!loading && currentUser && (currentUser.status === "pending_approval" || currentUser.roles.includes("pending"))) {
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
                Hello <strong>{currentUser.name}</strong>, your staff registration has been received and is waiting for Admin Okoye to assign your operational role.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left space-y-1 font-sans">
              <p className="font-bold">Registration Summary:</p>
              <p className="text-[11px] text-amber-800 font-mono">Phone: {currentUser.phone}</p>
              <p className="text-[11px] text-amber-800">Preferred Zone: {currentUser.zone_preference || "Hilltop"}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  setNotification("Checking approval status with server...");
                  const fresh = await getCurrentUser();
                  if (fresh && fresh.status === "active" && !fresh.roles.includes("pending")) {
                    setCurrentUser(fresh);
                    window.location.reload();
                  } else {
                    alert("Account is still awaiting Admin role assignment. Please notify Admin Okoye.");
                  }
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Approval Status</span>
              </button>

              <Link
                href="/accommodation"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors inline-block text-center"
              >
                Go to Overview
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Strict Role Protection: If user is not an Area Controller and not an Admin
  const isAuthorized = currentUser?.roles.includes("admin") || currentUser?.roles.includes("area_controller");
  if (!loading && currentUser && !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
        <AccommodationNav />
        <main className="max-w-md w-full mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mx-auto shadow-xs">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Area Controller Access Only
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your assigned role is <strong>{currentUser.roles[0]?.replace("_", " ")}</strong>. This workspace is reserved for on-ground Area Controllers.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/accommodation"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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
              className="text-emerald-100 hover:text-white ml-2 text-xs uppercase tracking-wider font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* CLEAN, CLEAR HEADER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-black uppercase tracking-wider text-emerald-900">
                <Building className="w-3.5 h-3.5 text-emerald-700" />
                Area Controller Dashboard
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Territory: {currentUser?.zone_preference || "Hilltop"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lodge Registration & Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Register lodges in your assigned zone, update vacant rooms in real-time, and manage caretaker contacts.
            </p>

            <div className="pt-2 text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Logged in as <strong>{currentUser?.name || "Staff Controller"}</strong></span>
              {currentUser?.phone && <span className="font-mono text-slate-400">({currentUser.phone})</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenAddLodge}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Lodge</span>
            </button>
          </div>
        </div>

        {/* 3 ESSENTIAL METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Lodges Mapped</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{lodges.length}</div>
            <p className="text-xs text-slate-400">Registered in field database</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Vacant Rooms Available</span>
              <Home className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{totalVacantRooms}</div>
            <p className="text-xs text-emerald-600 font-medium">Ready for immediate student intake</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Fully Occupied Lodges</span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalOccupiedLodges}</div>
            <p className="text-xs text-slate-400">Currently 0 vacant rooms</p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lodge name, landmark, or caretaker..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={filterVacancy}
              onChange={(e) => setFilterVacancy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="vacant_only">Vacant Lodges Only</option>
              <option value="occupied_only">Fully Occupied Only</option>
            </select>

            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Campus Zones</option>
              {NSUKKA_CAMPUS_AREAS.map((aName) => (
                <option key={aName} value={aName}>
                  {aName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LODGE DIRECTORY LIST */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Showing {filteredLodges.length} {filteredLodges.length === 1 ? "Lodge" : "Lodges"}</span>
            {filterVacancy !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setFilterVacancy("all");
                  setFilterArea("all");
                  setSearch("");
                }}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredLodges.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <Building className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {lodges.length === 0 ? "No Lodges Registered Yet" : "No Lodges Match Your Filter"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {lodges.length === 0
                  ? "Tap the button below to register your first lodge in your territory with caretaker contacts and vacant rooms."
                  : "Try clearing your search term or setting availability to 'All Availability'."}
              </p>
              {lodges.length === 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddLodge}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Register First Lodge</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLodges.map((lodge) => {
                const isVacant = lodge.is_vacant_now && lodge.vacancy_count > 0;
                return (
                  <div
                    key={lodge.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                      isVacant ? "border-slate-200 hover:border-emerald-400" : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    {/* Top Row: Name, Zone, Vacancy Badge */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {lodge.name}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              {lodge.area}
                            </span>
                          </div>
                          {lodge.address && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lodge.address}</span>
                            </p>
                          )}
                        </div>

                        {/* Availability Pill */}
                        <div className="shrink-0 text-right">
                          {isVacant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>{lodge.vacancy_count} {lodge.vacancy_count === 1 ? "Room" : "Rooms"} Vacant</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Occupied</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rent & Room Types */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Rent Rate</span>
                          <span className="text-sm font-black text-slate-900">{lodge.rent_per_session}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Room Structure</span>
                          <span className="font-semibold text-slate-700">{lodge.room_types || "Self-contain"}</span>
                        </div>
                      </div>

                      {/* Utilities Ground Truth */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md">
                          <Droplets className="w-3 h-3 text-sky-600" />
                          <span>{lodge.water_reliability}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>{lodge.light_reliability}</span>
                        </span>
                      </div>

                      {/* Caretaker Contact */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <div className="truncate">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Caretaker</span>
                          <strong className="text-slate-900 font-bold block truncate">{lodge.caretaker_name}</strong>
                          <span className="text-slate-500 font-mono text-[11px]">{lodge.caretaker_phone}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`tel:${lodge.caretaker_phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Call Caretaker"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${lodge.caretaker_phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="WhatsApp Caretaker"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {/* 1-Tap Toggle Vacancy */}
                      <button
                        type="button"
                        onClick={() => handleQuickToggleVacancy(lodge)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                          isVacant
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        }`}
                      >
                        {isVacant ? "Mark as Fully Occupied" : "Mark as Now Vacant (+1)"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLodge(lodge)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Lodge"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLodge(lodge.id, lodge.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lodge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REGISTER / EDIT LODGE MODAL */}
        {isLodgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {editingLodgeId ? "Edit Lodge Details" : "Register New Lodge"}
                    </h3>
                    <p className="text-[11px] text-slate-500">Record lodge availability and caretaker contacts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLodgeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLodge} className="space-y-4 text-xs font-sans">
                {/* Lodge Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lodge Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lodgeName}
                    onChange={(e) => setLodgeName(e.target.value)}
                    placeholder="e.g. Peace Haven Lodge"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Campus Zone & Rent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus Zone / Territory *
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {NSUKKA_CAMPUS_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Annual Rent Package *
                    </label>
                    <input
                      type="text"
                      required
                      value={rentPerSession}
                      onChange={(e) => setRentPerSession(e.target.value)}
                      placeholder="e.g. ₦250,000 / year"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Physical Address / Landmark */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Address & Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Hilltop Road, opposite St. Peter's Catholic Church"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Availability Toggle & Count */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Is There Room Vacancy Right Now?</span>
                      <span className="text-[11px] text-slate-500">Toggle whether students can move in</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVacantNow(!isVacantNow)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors cursor-pointer ${
                        isVacantNow ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isVacantNow ? "YES (Vacant)" : "NO (Occupied)"}
                    </button>
                  </div>

                  {isVacantNow && (
                    <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-950">Number of Vacant Rooms Available:</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={vacancyCount}
                        onChange={(e) => setVacancyCount(parseInt(e.target.value) || 1)}
                        className="w-20 p-2 bg-white border border-emerald-300 rounded-xl text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Caretaker Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Caretaker / Landlord Name
                    </label>
                    <input
                      type="text"
                      value={caretakerName}
                      onChange={(e) => setCaretakerName(e.target.value)}
                      placeholder="e.g. Mr. Chidi"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Caretaker Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={caretakerPhone}
                      onChange={(e) => setCaretakerPhone(e.target.value)}
                      placeholder="e.g. 0803 234 5678"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Water & Power Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Water Reliability
                    </label>
                    <select
                      value={waterReliability}
                      onChange={(e) => setWaterReliability(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Reliable Borehole">Reliable Borehole (Steady Water)</option>
                      <option value="Occasional">Occasional / Scheduled</option>
                      <option value="Public Tap Only">Public Tap Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Power / Light Situation
                    </label>
                    <select
                      value={lightReliability}
                      onChange={(e) => setLightReliability(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Regular Grid">Regular Campus Line</option>
                      <option value="Generator Supported">Generator Supported</option>
                      <option value="Poor">Poor / Irregular</option>
                    </select>
                  </div>
                </div>

                {/* Security Features */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security & Compound Features
                  </label>
                  <input
                    type="text"
                    value={securityFeatures}
                    onChange={(e) => setSecurityFeatures(e.target.value)}
                    placeholder="e.g. Compound gate with night lock, fenced premises"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLodgeModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{submitting ? "Saving..." : editingLodgeId ? "Update Lodge" : "Save & Register Lodge"}</span>
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
