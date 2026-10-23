"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccommodationNav from "@/components/AccommodationNav";
import {
  getLodges,
  createLodge,
  getCurrentUser,
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
  Sparkles,
  Award,
  Coins,
  GraduationCap,
  Droplets,
  Zap,
  Shield,
  User,
  Calendar,
  X,
} from "lucide-react";

export default function AreaControllerWorkspace() {
  const [lodges, setLodges] = useState<LodgeAsset[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterVacancyOnly, setFilterVacancyOnly] = useState(false);
  const [filterFinalYearOnly, setFilterFinalYearOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [area, setArea] = useState("Hilltop Phase 1");
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
  const [roomTypes, setRoomTypes] = useState("Self-contain");
  const [rentPerSession, setRentPerSession] = useState("₦250,000 / year");
  const [waterReliability, setWaterReliability] = useState<'Reliable Borehole' | 'Occasional' | 'Public Tap Only'>('Reliable Borehole');
  const [lightReliability, setLightReliability] = useState<'Regular Grid' | 'Generator Supported' | 'Poor'>('Regular Grid');
  const [securityFeatures, setSecurityFeatures] = useState("Fenced compound with security gate");

  useEffect(() => {
    async function load() {
      const [lList, cur] = await Promise.all([getLodges(), getCurrentUser()]);
      setLodges(lList);
      setCurrentUser(cur);
    }
    load();
  }, []);

  const handleCreateLodge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const created = await createLodge({
        name: name.trim(),
        area,
        address: address.trim(),
        caretaker_name: caretakerName.trim(),
        caretaker_phone: caretakerPhone.trim(),
        lodge_president_name: lodgePresidentName.trim() || undefined,
        lodge_president_phone: lodgePresidentPhone.trim() || undefined,
        shop_owner_contact: shopOwnerContact.trim() || undefined,
        is_vacant_now: isVacantNow,
        vacancy_count: Number(vacancyCount),
        expected_vacancy_date: expectedVacancyDate.trim() || undefined,
        has_final_year_students: hasFinalYearStudents,
        final_year_details: finalYearDetails.trim() || undefined,
        room_types: roomTypes.trim(),
        rent_per_session: rentPerSession.trim(),
        water_reliability: waterReliability,
        light_reliability: lightReliability,
        security_features: securityFeatures.trim(),
        is_verified: false,
        recorded_by_id: currentUser?.id || "u-emeka",
        recorded_by_name: currentUser?.name || "Area Controller",
      });

      setLodges([created, ...lodges]);
      setSuccessMessage(`Lodge "${created.name}" recorded successfully and queued for Admin review!`);
      setIsModalOpen(false);

      // Reset form
      setName("");
      setAddress("");
      setCaretakerName("");
      setCaretakerPhone("");
      setLodgePresidentName("");
      setLodgePresidentPhone("");
      setFinalYearDetails("");
      setHasFinalYearStudents(false);
    } catch (err: any) {
      alert("Failed to save lodge: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLodges = lodges.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.area.toLowerCase().includes(search.toLowerCase()) ||
      l.caretaker_name.toLowerCase().includes(search.toLowerCase());
    const matchesArea = filterArea === "all" || l.area === filterArea;
    const matchesVacancy = !filterVacancyOnly || (l.is_vacant_now && l.vacancy_count > 0);
    const matchesFinalYear = !filterFinalYearOnly || l.has_final_year_students;
    return matchesSearch && matchesArea && matchesVacancy && matchesFinalYear;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AccommodationNav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TOP CONTROLLER IDENTITY & REWARDS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Field Workspace</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Area Controller Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Logged in as: <strong className="text-slate-800">{currentUser?.name}</strong> &bull; Ground Reconnaissance & Lodge Sourcing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] font-bold uppercase text-slate-500">My Performance Score</div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1 justify-end">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{currentUser?.total_points || 0} Pts</span>
                <span className="text-xs text-emerald-700 font-mono font-bold">
                  (₦{(currentUser?.cash_value_earned || 0).toLocaleString()})
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 bg-kingsok-700 hover:bg-kingsok-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record New Lodge</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-semibold shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* AREA CONTROLLER DAILY MISSION BRIEF */}
        <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800 pb-3">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Your Daily Field Mission & Targets</span>
            </h2>
            <span className="text-[11px] text-emerald-300 font-mono">
              Reward: 1 - 3 Pts per verified lodge + Agency fee cut on closed deals!
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-1">
              <span className="font-bold text-white block">1. Connect with Caretakers</span>
              <span className="text-emerald-200/80">
                Get direct phone numbers, establish trust, and confirm official representation for upcoming intakes.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-1">
              <span className="font-bold text-white block">2. Meet Lodge Presidents</span>
              <span className="text-emerald-200/80">
                Identify graduating final year students vacating their rooms and help them sell their household property.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-1">
              <span className="font-bold text-white block">3. Verify Real Conditions</span>
              <span className="text-emerald-200/80">
                Never hide details! Verify borehole water flow, light reality, and security gate conditions.
              </span>
            </div>
          </div>
        </div>

        {/* LODGE DATABASE & SEARCH CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Scouted Lodge Registry ({filteredLodges.length})
              </h3>
              <p className="text-xs text-slate-500">
                All student lodges and houses registered in your sector database.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search lodge or caretaker..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none w-48"
                />
              </div>

              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="all">All Areas</option>
                <option value="Hilltop Phase 1">Hilltop Phase 1</option>
                <option value="Odim Gate Area">Odim Gate Area</option>
                <option value="Ofulonu Zone">Ofulonu Zone</option>
                <option value="Behind Flat">Behind Flat</option>
              </select>

              <button
                onClick={() => setFilterVacancyOnly(!filterVacancyOnly)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  filterVacancyOnly
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Vacancies Only
              </button>

              <button
                onClick={() => setFilterFinalYearOnly(!filterFinalYearOnly)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                  filterFinalYearOnly
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Final Years Vacating
              </button>
            </div>
          </div>

          {/* LODGES CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLodges.map((lodge) => (
              <div
                key={lodge.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {lodge.name}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 block">
                      {lodge.area} &bull; {lodge.address}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {lodge.is_vacant_now ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {lodge.vacancy_count} Vacancies Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Occupied
                      </span>
                    )}

                    {lodge.admin_points_awarded && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>+{lodge.admin_points_awarded} Points Awarded</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Contacts Table Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Caretaker:
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      {lodge.caretaker_name} &bull;{" "}
                      <a href={`tel:${lodge.caretaker_phone}`} className="text-emerald-700 hover:underline">
                        {lodge.caretaker_phone}
                      </a>
                    </span>
                  </div>

                  {lodge.lodge_president_name && (
                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                        Lodge President:
                      </span>
                      <span className="font-bold text-slate-900">
                        {lodge.lodge_president_name} ({lodge.lodge_president_phone})
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Year Intel Alert */}
                {lodge.has_final_year_students && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-purple-800">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Graduating Students vacating soon (Property Sale Potential):</span>
                    </div>
                    <p className="text-[11px] text-purple-800/90 leading-snug">
                      {lodge.final_year_details || "Final year students vacating at end of session."}
                    </p>
                  </div>
                )}

                {/* Utilities & Rent */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1" title="Water Reliability">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lodge.water_reliability}</span>
                    </span>

                    <span className="flex items-center gap-1" title="Light Reliability">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lodge.light_reliability}</span>
                    </span>
                  </div>

                  <div className="font-extrabold text-slate-900 font-mono">
                    {lodge.rent_per_session}
                  </div>
                </div>

                {/* Admin Feedback Display if exists */}
                {lodge.admin_feedback && (
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                    <strong>Admin Note:</strong> {lodge.admin_feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MODAL: FAST LODGE RECORDER (UNDER 60 SECONDS) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Record Lodge Reconnaissance
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter details immediately while at the lodge site
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLodge} className="space-y-4 text-xs">
                {/* Lodge Name & Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lodge Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Divine Grace Lodge"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Area / Zone *
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      <option value="Hilltop Phase 1">Hilltop Phase 1</option>
                      <option value="Hilltop Phase 2">Hilltop Phase 2</option>
                      <option value="Odim Gate Area">Odim Gate Area</option>
                      <option value="Ofulonu Zone">Ofulonu Zone</option>
                      <option value="Behind Flat">Behind Flat</option>
                      <option value="Alvan Ikoku Area">Alvan Ikoku Area</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Exact Address / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 University Road, opposite St. Peter Church"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>

                {/* Caretaker Details */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-900 block">
                    Caretaker / Landlord Contact (Required)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Caretaker Name"
                      value={caretakerName}
                      onChange={(e) => setCaretakerName(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Caretaker Phone Number"
                      value={caretakerPhone}
                      onChange={(e) => setCaretakerPhone(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                {/* Lodge President Contact (Bonus Intel) */}
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                  <span className="font-bold text-purple-900 block">
                    Lodge President Intel (High-Value Bonus)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Lodge President Name"
                      value={lodgePresidentName}
                      onChange={(e) => setLodgePresidentName(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-600 outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="President Phone Number"
                      value={lodgePresidentPhone}
                      onChange={(e) => setLodgePresidentPhone(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-600 outline-none"
                    />
                  </div>
                </div>

                {/* Vacancy Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Are there current vacancies?
                    </label>
                    <select
                      value={isVacantNow ? "yes" : "no"}
                      onChange={(e) => setIsVacantNow(e.target.value === "yes")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none font-bold"
                    >
                      <option value="yes">YES (Rooms Open Now)</option>
                      <option value="no">NO (Currently Full)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Number of Vacant Rooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={vacancyCount}
                      onChange={(e) => setVacancyCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                {/* Final Year Students Question */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">
                      Does this lodge have Final Year students graduating soon?
                    </label>
                    <input
                      type="checkbox"
                      checked={hasFinalYearStudents}
                      onChange={(e) => setHasFinalYearStudents(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </div>

                  {hasFinalYearStudents && (
                    <textarea
                      placeholder="Note room numbers, graduating students, items to sell (e.g. Fridge, mattress, gas cylinder)..."
                      value={finalYearDetails}
                      onChange={(e) => setFinalYearDetails(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  )}
                </div>

                {/* Rent & Utilities */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Rent per Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₦280k"
                      value={rentPerSession}
                      onChange={(e) => setRentPerSession(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Water Supply
                    </label>
                    <select
                      value={waterReliability}
                      onChange={(e) => setWaterReliability(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      <option value="Reliable Borehole">Reliable Borehole</option>
                      <option value="Occasional">Occasional</option>
                      <option value="Public Tap Only">Public Tap Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Light Reliability
                    </label>
                    <select
                      value={lightReliability}
                      onChange={(e) => setLightReliability(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-600 outline-none"
                    >
                      <option value="Regular Grid">Regular Grid</option>
                      <option value="Generator Supported">Generator Supported</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-kingsok-700 hover:bg-kingsok-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save & Submit Lodge"}
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
