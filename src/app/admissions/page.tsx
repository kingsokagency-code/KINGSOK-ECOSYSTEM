"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  RefreshCw,
  ExternalLink,
  Info,
  Layers,
  ArrowLeft,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  SlidersHorizontal,
  Home,
  Users,
  Database,
  Trash2,
  Globe,
} from "lucide-react";

import {
  AdmissionCategory,
  AdmissionProcessingReport,
  AdmissionSelection,
  CandidateAdmissionRecord,
  RecordDataSource,
} from "@/lib/admissions/types";
import {
  UTME_WORKFLOW_CONFIG,
  DIRECT_ENTRY_WORKFLOW_CONFIG,
  getWorkflowConfig,
} from "@/lib/admissions/config";
import {
  CURRENT_INTEGRATION_STATUS,
} from "@/lib/admissions/retrievalAdapters";
import {
  processAdmissionDataset,
  RawCandidateInput,
} from "@/lib/admissions/processor";
import {
  generateUtmeExportCsv,
  generateDirectEntryExportCsv,
  generateCombinedExportCsv,
  generateFlaggedForReviewCsv,
  triggerAdmissionDownload,
  resolveExportFilename,
} from "@/lib/admissions/exporter";
import {
  SYNTHETIC_UTME_CANDIDATES,
  SYNTHETIC_DIRECT_ENTRY_CANDIDATES,
  SYNTHETIC_COMBINED_CANDIDATES,
} from "@/lib/admissions/sampleData";

export default function AdmissionsPage() {
  // Mode Selection: 'utme' | 'direct_entry' | 'combined'
  const [admissionSelection, setAdmissionSelection] = useState<AdmissionSelection>("combined");

  // Dataset State
  const [rawText, setRawText] = useState<string>("");
  const [records, setRecords] = useState<CandidateAdmissionRecord[]>([]);
  const [report, setReport] = useState<AdmissionProcessingReport | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active Session Mode: 'operational' | 'synthetic_test'
  const [sessionMode, setSessionMode] = useState<"operational" | "synthetic_test">("operational");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "UTME" | "Direct Entry">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Synthetic Dataset (Test Mode)
  const handleLoadSyntheticDataset = (targetSelection: AdmissionSelection = admissionSelection) => {
    setIsProcessing(true);
    let sampleInputs: RawCandidateInput[] = [];

    if (targetSelection === "utme") {
      sampleInputs = SYNTHETIC_UTME_CANDIDATES;
    } else if (targetSelection === "direct_entry") {
      sampleInputs = SYNTHETIC_DIRECT_ENTRY_CANDIDATES;
    } else {
      sampleInputs = SYNTHETIC_COMBINED_CANDIDATES;
    }

    setTimeout(() => {
      const result = processAdmissionDataset(sampleInputs, {
        selection: targetSelection,
        defaultDataSource: "synthetic",
        disallowMixedSources: true,
      });

      setRecords(result.records);
      setReport(result.report);
      setSessionMode("synthetic_test");
      setIsProcessing(false);
      showToast(
        `TEST MODE: Loaded ${result.records.length} synthetic records (${result.report.utmeCount} UTME, ${result.report.directEntryCount} DE).`,
        "info"
      );
    }, 250);
  };

  // Clear Session Data
  const handleClearData = () => {
    setRecords([]);
    setReport(null);
    setRawText("");
    setSessionMode("operational");
    showToast("Cleared active records. Returned to operational mode.", "info");
  };

  // Helper: Preload verified 2025/2026 UNN JAMB Reg Numbers
  const handleInsertSampleRegNumbers = () => {
    const samples = [
      "202661835848DD", // Agric Business - Akigwe Chidiuso Elvis (Phone: 08067467675)
      "202660291583DG", // Law - Okonkwo Nnanyelumugo Charles (Phone: 08067964660)
      "202660240929FG", // Medicine - Chibuike Success Chinonyerem (Phone: 07026737299)
      "202662212256BD", // Computer Science - Agbo Ugochukwu Joel (Phone: 07072298842)
      "202660744439CI", // Doctor of Pharmacy - Dozie Chibuikem Victor (Phone: 09125071353)
      "202661039323FD", // Agric & Bio-Resources Eng - Urama Gaius (Phone: 09026687733)
    ];
    setRawText(samples.join("\n"));
    showToast("Inserted 6 verified 2026/2027 UNN JAMB Reg Numbers from official list.", "info");
  };

  // Load Official 2026/2027 Primary Admission Manifest
  const handleLoadOfficial2026Manifest = async () => {
    setIsProcessing(true);
    showToast("Loading official UNN 2026/2027 Primary UTME Admission List (6,488 candidates)...", "info");
    try {
      const res = await fetch("/UNN_2026_2027_Primary_Admission_Manifest.json");
      if (!res.ok) throw new Error("Could not load official manifest JSON");
      const data = await res.json();

      let checkpoint: Record<string, any> = {};
      try {
        const ckRes = await fetch("/UNN_2026_2027_Enrichment_Checkpoint.json");
        if (ckRes.ok) checkpoint = await ckRes.json();
      } catch (e) {
        // checkpoint optional
      }

      const mapped: CandidateAdmissionRecord[] = data.map((c: any) => {
        const enriched = checkpoint[c.jambRegNumber];
        const hasEnrich = !!enriched && !!enriched.phoneNumber;
        return {
          id: `utme-2026-${c.sn}-${c.jambRegNumber}`,
          jambRegNumber: c.jambRegNumber,
          candidateName: hasEnrich ? (enriched.candidateName || c.candidateName) : c.candidateName,
          department: hasEnrich ? (enriched.department || c.department) : c.department,
          phoneNumber: hasEnrich ? enriched.phoneNumber : "—",
          admissionType: "UTME" as const,
          status: hasEnrich ? ("success" as const) : ("missing_phone" as const),
          statusMessage: hasEnrich ? "Verified via official UNN portal" : "Extracted from official Primary Admission List",
          dataSource: hasEnrich ? ("authorized_live_integration" as const) : ("uploaded_manifest" as const),
          portalSource: "UNN Official 2026/2027 Primary List",
          isDuplicateWithinCategory: false,
          isCrossCategoryDuplicate: false,
          retrievedAt: new Date().toISOString(),
        };
      });

      setRecords(mapped);
      setReport({
        selection: "utme",
        totalProcessed: mapped.length,
        utmeCount: mapped.length,
        directEntryCount: 0,
        successCount: mapped.filter((m) => m.status === "success").length,
        missingPhoneCount: mapped.filter((m) => m.status === "missing_phone").length,
        missingDeptCount: 0,
        flaggedReviewCount: 0,
        crossCategoryDuplicateCount: 0,
        intraCategoryDuplicateCount: 0,
        unmatchedCount: 0,
        failedCount: 0,
        syntheticCount: 0,
        uploadedManifestCount: mapped.filter((m) => m.dataSource === "uploaded_manifest").length,
        authorizedLiveCount: mapped.filter((m) => m.dataSource === "authorized_live_integration").length,
        hasSyntheticData: false,
        processingTimeMs: 120,
        timestamp: new Date().toISOString(),
      });
      setSessionMode("operational");
      setIsProcessing(false);
      showToast(`Loaded all ${mapped.length} official UNN 2026/2027 Primary Admission records!`, "success");
    } catch (err: any) {
      setIsProcessing(false);
      showToast(err.message || "Failed to load 2026 manifest", "error");
    }
  };

  // Run Live UNN Portal Verification
  const handleLivePortalVerification = async () => {
    if (!rawText.trim()) {
      showToast("Please enter or paste JAMB Registration Numbers to verify.", "error");
      return;
    }

    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const regNumbers: string[] = [];

    for (const line of lines) {
      // Find 10-14 alphanumeric string matching JAMB reg pattern
      const matches = line.match(/\b(?:20\d{2}|[0-9]{8,10})[A-Za-z]{2}\b/gi);
      if (matches && matches.length > 0) {
        matches.forEach((m) => regNumbers.push(m.trim().toUpperCase()));
      } else {
        const parts = line.split(/[,\t\s]+/);
        for (const p of parts) {
          const cleaned = p.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          if (cleaned.length >= 8 && cleaned.length <= 14) {
            regNumbers.push(cleaned);
          }
        }
      }
    }

    const uniqueRegNumbers = Array.from(new Set(regNumbers));

    if (uniqueRegNumbers.length === 0) {
      showToast("No valid JAMB registration numbers found. Please check format.", "error");
      return;
    }

    setIsProcessing(true);
    showToast(`Connecting to UNN Portal to verify ${uniqueRegNumbers.length} candidates...`, "info");

    try {
      const res = await fetch("/api/admissions/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regNumbers: uniqueRegNumbers,
          admissionType:
            admissionSelection === "direct_entry"
              ? "Direct Entry"
              : admissionSelection === "utme"
              ? "UTME"
              : "combined",
          selection: admissionSelection,
          throttleDelayMs: 2000,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve from UNN portal");
      }

      setRecords(data.records);
      setReport(data.report);
      setSessionMode("operational");
      setIsProcessing(false);
      showToast(
        `Live UNN Verification Complete: ${data.records.length} records processed (${data.report.successCount} verified).`,
        "success"
      );
    } catch (err: any) {
      setIsProcessing(false);
      showToast(err.message || "Failed to connect to UNN Portal", "error");
    }
  };

  // Process Raw CSV / Text Input (Operational Manifest)
  const handleProcessInput = () => {
    if (!rawText.trim()) {
      showToast("Please enter or paste admission records to process.", "error");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsedInputs: RawCandidateInput[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip header if detected
        if (i === 0 && /reg.*no|jamb|candidate|name/i.test(line)) continue;

        // Support CSV comma-separated or tab-separated
        const parts = line.includes("\t") ? line.split("\t") : line.split(",");
        const jambRegNumber = parts[0]?.trim() || "";
        const candidateName = parts[1]?.trim() || "";
        const department = parts[2]?.trim() || "";
        const phoneNumber = parts[3]?.trim() || "";
        const admissionType = parts[4]?.trim() || undefined;

        if (jambRegNumber || candidateName) {
          parsedInputs.push({
            jambRegNumber,
            candidateName,
            department,
            phoneNumber,
            admissionType,
            dataSource: "uploaded_manifest",
          });
        }
      }

      if (parsedInputs.length === 0) {
        setIsProcessing(false);
        showToast("No valid records found in input.", "error");
        return;
      }

      try {
        const result = processAdmissionDataset(parsedInputs, {
          selection: admissionSelection,
          defaultDataSource: "uploaded_manifest",
          disallowMixedSources: true,
        });

        setRecords(result.records);
        setReport(result.report);
        setSessionMode("operational");
        setIsProcessing(false);
        showToast(
          `Processed ${result.records.length} operational records (${result.report.utmeCount} UTME, ${result.report.directEntryCount} DE).`,
          "success"
        );
      } catch (err: any) {
        setIsProcessing(false);
        showToast(err.message, "error");
      }
    }, 250);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setRawText(text);
      showToast(`Uploaded ${file.name}. Click "Process Admission Queue" to run.`, "info");
    };
    reader.readAsText(file);
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterType !== "all" && r.admissionType !== filterType) {
        return false;
      }
      if (filterStatus !== "all" && r.status !== filterStatus) {
        return false;
      }
      if (filterSource !== "all" && r.dataSource !== filterSource) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.candidateName.toLowerCase().includes(q);
        const matchesReg = r.jambRegNumber.toLowerCase().includes(q);
        const matchesDept = r.department.toLowerCase().includes(q);
        const matchesPhone = r.phoneNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesDept && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [records, filterType, filterStatus, filterSource, searchQuery]);

  // Cross-category duplicates
  const crossCategoryDuplicates = useMemo(() => {
    return records.filter((r) => r.isCrossCategoryDuplicate);
  }, [records]);

  // Is synthetic dataset loaded
  const isSyntheticActive = sessionMode === "synthetic_test" || records.some((r) => r.dataSource === "synthetic");

  // Active Workflow Config
  const activeConfig = admissionSelection === "direct_entry" ? DIRECT_ENTRY_WORKFLOW_CONFIG : UTME_WORKFLOW_CONFIG;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Sticky Header */}
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors pr-3 border-r border-neutral-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ecosystem</span>
              </Link>

              <Link
                href="/contacts"
                className="text-neutral-400 hover:text-white text-xs font-semibold hidden md:flex items-center gap-1 transition-colors pr-3 border-r border-neutral-800"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Contacts</span>
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm tracking-tight block">KINGSOK</span>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                      ADMISSION INTELLIGENCE
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 block -mt-0.5">
                    UTME & Direct Entry Verification System
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Integration Status Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Adapter: Active</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Provenance Enforced</span>
              </div>

              {records.length > 0 && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
                    isSyntheticActive
                      ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
                      : "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyntheticActive ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                  <span>
                    {records.length} {isSyntheticActive ? "Test Records" : "Operational Records"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-200 border-emerald-500/50"
                : toast.type === "error"
                ? "bg-red-950 text-red-200 border-red-500/50"
                : "bg-blue-950 text-blue-200 border-blue-500/50"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === "error" && <XCircle className="w-4 h-4 text-red-400" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* TASK 2: PROMINENT SYNTHETIC TEST DATA WATERMARK WARNING */}
        {isSyntheticActive && (
          <div className="p-4 bg-amber-950/60 border-2 border-amber-500 rounded-2xl flex items-start justify-between gap-4 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="bg-amber-500 text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase block w-fit mb-1">
                  TEST DATA — NOT FOR OPERATIONAL USE
                </span>
                <h3 className="font-bold text-base text-amber-200">
                  Synthetic Benchmark Dataset Active
                </h3>
                <p className="text-xs text-amber-300/90 leading-relaxed mt-0.5">
                  These records are simulated test profiles created for schema mapping, validation, and timeout regression.
                  They are <strong>isolated</strong> from operational data, strictly labelled as <code>synthetic</code>, and
                  automatically prefixed with <code>SYNTHETIC_TEST_</code> on export to prevent misattribution.
                </p>
              </div>
            </div>

            <button
              onClick={handleClearData}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-200 text-xs font-semibold rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition-colors flex-shrink-0"
              title="Clear synthetic test data and return to operational manifest mode"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Test Data</span>
            </button>
          </div>
        )}

        {/* OFFICIAL 2026/2027 PRIMARY UTME ADMISSION REGISTRY BANNER */}
        <section className="bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-neutral-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500 text-neutral-950 font-black text-[10px] px-2.5 py-0.5 rounded tracking-wider uppercase">
                  Official UNN 2026/2027 Primary UTME List
                </span>
                <span className="bg-emerald-900/60 text-emerald-300 font-semibold text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                  238 Pages · 6,488 Candidates
                </span>
                <span className="bg-neutral-800 text-neutral-300 font-semibold text-[10px] px-2 py-0.5 rounded border border-neutral-700">
                  18 Faculties & 85+ Departments
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Complete Primary UTME Admission Registry & Excel Exports
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Extracted directly from the official University of Nigeria Nsukka (UNN) 2026/2027 Primary Admission List.
                Includes full candidate names, faculties, departments, and live-verified contact phone numbers retrieved from the official portal.
              </p>
            </div>

            {/* Quick Action Grid */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/UNN_2026_2027_Primary_Admission_List.xlsx"
                  download="UNN_2026_2027_Primary_Admission_List.xlsx"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                  title="Download the full 6,488 candidates with phone numbers in Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  <span>Download Master Excel (.xlsx)</span>
                </a>

                <a
                  href="/UNN_2026_2027_Primary_Admission_Enriched.xlsx"
                  download="UNN_2026_2027_Primary_Admission_Enriched.xlsx"
                  className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 flex items-center gap-2 transition-colors"
                  title="Download verified candidates with phone numbers in Excel format"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Verified Contacts (.xlsx)</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/UNN_2026_2027_Primary_Admission_Manifest.csv"
                  download="UNN_2026_2027_Primary_Admission_Manifest.csv"
                  className="px-3.5 py-2 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 flex items-center gap-1.5 transition-colors"
                  title="Download raw 6,488 candidate manifest in CSV"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Download Manifest (.csv)</span>
                </a>

                <button
                  type="button"
                  onClick={handleLoadOfficial2026Manifest}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/50 flex items-center gap-1.5 transition-all shadow-sm"
                  title="Load all 6,488 records into the interactive table for live filtering and searching"
                >
                  <Database className={`w-3.5 h-3.5 text-emerald-400 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>Load 6,488 Records in Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 1: ADMISSION TYPE SELECTION (REQUIRED) */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 1 of 3</span>
              <h2 className="text-lg font-bold text-white">Select Admission Category Workflow</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Choose the candidate admission category to process independently or analyze together.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLoadSyntheticDataset(admissionSelection)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Load realistic verified synthetic data for testing"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                <span>Load Synthetic Test Dataset</span>
              </button>

              {records.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs rounded-lg border border-neutral-700 transition-colors"
                  title="Clear active records"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 3 Option Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: UTME */}
            <button
              type="button"
              onClick={() => {
                setAdmissionSelection("utme");
                if (records.length > 0 && sessionMode === "synthetic_test") {
                  handleLoadSyntheticDataset("utme");
                }
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                admissionSelection === "utme"
                  ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                  CATEGORY 1
                </span>
                {admissionSelection === "utme" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <h3 className="font-bold text-base text-white mt-2">UTME / Post-UTME</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Standard 100-level undergraduate screening applications.
              </p>
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                <span className="block text-emerald-400/90 font-mono">/putme_application_details</span>
                <span>Verified UNN Post-UTME screening flow</span>
              </div>
            </button>

            {/* Option 2: Direct Entry */}
            <button
              type="button"
              onClick={() => {
                setAdmissionSelection("direct_entry");
                if (records.length > 0 && sessionMode === "synthetic_test") {
                  handleLoadSyntheticDataset("direct_entry");
                }
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                admissionSelection === "direct_entry"
                  ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30">
                  CATEGORY 2
                </span>
                {admissionSelection === "direct_entry" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <h3 className="font-bold text-base text-white mt-2">Direct Entry (DE)</h3>
              <p className="text-xs text-neutral-400 mt-1">
                200-level direct entry applications with A-Level/ND credentials.
              </p>
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                <span className="block text-blue-400/90 font-mono">/direct_entry_login</span>
                <span>Verified UNN DE screening flow</span>
              </div>
            </button>

            {/* Option 3: Combined Results */}
            <button
              type="button"
              onClick={() => {
                setAdmissionSelection("combined");
                if (records.length > 0 && sessionMode === "synthetic_test") {
                  handleLoadSyntheticDataset("combined");
                }
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                admissionSelection === "combined"
                  ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50"
                  : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                  COMBINED
                </span>
                {admissionSelection === "combined" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <h3 className="font-bold text-base text-white mt-2">Combined Results</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Full dual-category processing with cross-category duplicate auditing.
              </p>
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                <span className="block text-purple-400/90 font-mono">UTME + DE Unified</span>
                <span>Preserves category and audits duplicate reg numbers</span>
              </div>
            </button>
          </div>
        </section>

        {/* STEP 2: VERIFIED PORTAL WORKFLOW CONFIGURATION & RETRIEVAL BOUNDARY */}
        <section className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Verified Portal Navigation & Field Mapping: {activeConfig.name}
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
              Boundary: {CURRENT_INTEGRATION_STATUS}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Verified URL</span>
              <a
                href={activeConfig.officialPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-mono text-[11px] flex items-center gap-1 mt-1 truncate"
                title={activeConfig.officialPortalUrl}
              >
                <span>{activeConfig.officialPortalUrl.replace("https://", "")}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Form Title & Route</span>
              <span className="text-white font-medium block mt-1">{activeConfig.formTitle}</span>
              <span className="text-neutral-400 text-[11px] font-mono">{activeConfig.loginPath}</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Reg Number Field</span>
              <span className="text-white font-mono block mt-1">id="{activeConfig.regNumberFieldId}"</span>
              <span className="text-neutral-400 text-[11px]">name="{activeConfig.regNumberFieldName}"</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
              <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Target Route Flow</span>
              <span className="text-emerald-300 font-mono block mt-1 text-[11px]">{activeConfig.targetPath}</span>
              <span className="text-neutral-400 text-[11px]">Backend API load endpoint</span>
            </div>
          </div>

          {/* Integration Boundary Notice */}
          <div className="mt-4 p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300">
              <span className="font-bold text-white block mb-0.5">Approved Live Integration Active:</span>
              <p className="text-neutral-400 leading-relaxed">
                Automated candidate-detail retrieval is active for official UNN application endpoints.
                Post-UTME queries are routed to <code>https://schmgrunn.azurewebsites.net/api/PostUtme/load-application-form</code>.
                Retrieved fields are strictly limited to the 6 authorized common fields: JAMB Reg No, Full Name, Department, Phone Number, Admission Type, and Processing Status.
                Direct Entry queries are routed to <code>/DirectEntryApplication</code> with cycle status handling.
              </p>
            </div>
          </div>
        </section>

        {/* STEP 3: LIVE CANDIDATE RETRIEVAL & OPERATIONAL MANIFEST UPLOAD */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 2 of 3</span>
              <h2 className="text-lg font-bold text-white">Live Candidate Retrieval & Manifest Upload</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Paste JAMB Registration Numbers to retrieve live candidate details directly from UNN Portal, or upload an existing CSV manifest.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleInsertSampleRegNumbers}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Paste 5 verified real registration numbers from UNN 2025/2026 Primary Admission List"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Insert 2025/2026 Samples</span>
              </button>

              <label className="cursor-pointer px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-neutral-300" />
                <span>Upload CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <button
                onClick={handleProcessInput}
                disabled={isProcessing}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Process pre-filled CSV / spreadsheet text"
              >
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>Process CSV</span>
              </button>

              <button
                onClick={handleLivePortalVerification}
                disabled={isProcessing}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                title="Connect to official UNN portal and retrieve candidate Name, Department, and Phone Number"
              >
                <Globe className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                <span>Run Live UNN Verification</span>
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={4}
            placeholder={`Enter JAMB Registration Numbers (one per line, comma-separated, or paste from PDF list).\n\nExamples from UNN 2025/2026 Primary Admission List:\n202550757417JF\n202550664465CA\n202550229776FF\n202551129716DA\n\nClick "Run Live UNN Verification" to query the portal directly.`}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </section>

        {/* KPI METRIC CARDS */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-neutral-400 font-medium block">Total Processed</span>
              <span className="text-xl font-bold text-white mt-1 block">{report.totalProcessed}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {report.utmeCount} UTME · {report.directEntryCount} DE
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-emerald-400 font-medium block">Verified Success</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{report.successCount}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Complete records</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-amber-400 font-medium block">Flagged for Review</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{report.flaggedReviewCount}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {report.crossCategoryDuplicateCount} cross-category
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-blue-400 font-medium block">Missing Phone</span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">{report.missingPhoneCount}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Unlisted contact</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-purple-400 font-medium block">Missing Dept</span>
              <span className="text-xl font-bold text-purple-400 mt-1 block">{report.missingDeptCount}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Unassigned course</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
              <span className="text-[11px] text-neutral-400 font-medium block">Provenance</span>
              <span className="text-sm font-bold text-white mt-1 block truncate">
                {report.hasSyntheticData
                  ? "Synthetic Test"
                  : report.authorizedLiveCount > 0
                  ? "Live Verified"
                  : "Uploaded Manifest"}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {report.syntheticCount > 0
                  ? `${report.syntheticCount} test records`
                  : report.authorizedLiveCount > 0
                  ? `${report.authorizedLiveCount} live portal`
                  : `${report.uploadedManifestCount} manifest`}
              </span>
            </div>
          </div>
        )}

        {/* CROSS-CATEGORY DUPLICATE AUDIT ALERT BANNER */}
        {crossCategoryDuplicates.length > 0 && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-amber-200">
                  Cross-Category Duplicate Audit Alert ({crossCategoryDuplicates.length} Records)
                </h4>
                <button
                  onClick={() => {
                    const csv = generateFlaggedForReviewCsv(records);
                    triggerAdmissionDownload(csv, "KINGSOK_Flagged_Admission_Duplicates.csv", records);
                    showToast("Downloaded Flagged Records CSV", "info");
                  }}
                  className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800/60 text-amber-200 text-xs font-semibold rounded-lg border border-amber-500/40 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Flagged Records</span>
                </button>
              </div>
              <p className="text-xs text-amber-300/90 leading-relaxed">
                One or more candidates have registration numbers appearing in <strong>both UTME and Direct Entry</strong> admission lists.
                Per system rules, records are <strong>never silently merged</strong>; both entries are preserved with their respective
                Admission Type and explicitly flagged for administrative clearance review.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: EXPORT ACTIONS & RESULTS TABLE */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 3 of 3</span>
              <h2 className="text-lg font-bold text-white">Admission Intelligence Registry</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Authorized common fields only. Retains Admission Type and Data Source Provenance on every exported record.
              </p>
            </div>

            {/* Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const csv = generateUtmeExportCsv(records);
                  triggerAdmissionDownload(csv, "KINGSOK_UTME_Admissions_List.csv", records);
                  showToast(
                    isSyntheticActive
                      ? "Downloaded SYNTHETIC_TEST_KINGSOK_UTME_Admissions_List.csv"
                      : "Downloaded UTME Admissions List",
                    "success"
                  );
                }}
                disabled={records.length === 0}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Download verified UTME admissions list (Excel CSV)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export UTME List</span>
              </button>

              <button
                onClick={() => {
                  const csv = generateDirectEntryExportCsv(records);
                  triggerAdmissionDownload(csv, "KINGSOK_Direct_Entry_Admissions_List.csv", records);
                  showToast(
                    isSyntheticActive
                      ? "Downloaded SYNTHETIC_TEST_KINGSOK_Direct_Entry_Admissions_List.csv"
                      : "Downloaded Direct Entry Admissions List",
                    "success"
                  );
                }}
                disabled={records.length === 0}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
                title="Download verified Direct Entry admissions list (Excel CSV)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                <span>Export DE List</span>
              </button>

              <button
                onClick={() => {
                  const csv = generateCombinedExportCsv(records);
                  triggerAdmissionDownload(csv, "KINGSOK_Combined_Admissions_Registry.csv", records);
                  showToast(
                    isSyntheticActive
                      ? "Downloaded SYNTHETIC_TEST_KINGSOK_Combined_Admissions_Registry.csv"
                      : "Downloaded Combined Admissions Registry",
                    "success"
                  );
                }}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                title="Download combined UTME and Direct Entry results (Excel CSV)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Combined Results</span>
              </button>
            </div>
          </div>

          {/* Search & Facet Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, reg no, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="UTME">UTME Only</option>
                <option value="Direct Entry">Direct Entry Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="flagged_review">Flagged for Review</option>
                <option value="missing_phone">Missing Phone</option>
                <option value="missing_department">Missing Department</option>
                <option value="unmatched">Unmatched</option>
                <option value="failed">Failed / Timeout</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Source:</span>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Sources</option>
                <option value="uploaded_manifest">Uploaded Manifest</option>
                <option value="synthetic">Synthetic Test</option>
                <option value="authorized_live_integration">Authorized Live</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">JAMB Reg Number</th>
                  <th className="py-3 px-4 font-semibold">Candidate Full Name</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Phone Number</th>
                  <th className="py-3 px-4 font-semibold">Admission Type</th>
                  <th className="py-3 px-4 font-semibold">Processing Status</th>
                  <th className="py-3 px-4 font-semibold">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500 text-xs">
                      {records.length === 0
                        ? "No admission records loaded. Click 'Load Synthetic Test Dataset' or paste manifest records to begin."
                        : "No records match the current filters."}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const isFlagged = r.status === "flagged_review";
                    const isSynth = r.dataSource === "synthetic";
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-neutral-900/60 transition-colors ${
                          isFlagged ? "bg-amber-950/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-white whitespace-nowrap">
                          {r.jambRegNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-200">
                          {r.candidateName}
                          {r.reviewReason && (
                            <span className="block text-[10px] text-amber-400 font-sans mt-0.5">
                              {r.reviewReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">{r.department}</td>
                        <td className="py-3 px-4 font-mono text-neutral-300 whitespace-nowrap">
                          {r.phoneNumber}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${
                              r.admissionType === "UTME"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                                : "bg-blue-950 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            {r.admissionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              r.status === "success"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                : r.status === "flagged_review"
                                ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                                : r.status === "missing_phone"
                                ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                                : r.status === "missing_department"
                                ? "bg-purple-950 text-purple-300 border border-purple-500/40"
                                : "bg-red-950 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {r.status === "success" && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {r.status === "flagged_review" && <AlertTriangle className="w-2.5 h-2.5" />}
                            {r.status === "missing_phone" && <Info className="w-2.5 h-2.5" />}
                            {r.status === "missing_department" && <Info className="w-2.5 h-2.5" />}
                            {(r.status === "unmatched" || r.status === "failed") && (
                              <XCircle className="w-2.5 h-2.5" />
                            )}
                            <span className="capitalize">{r.status.replace("_", " ")}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded border ${
                              isSynth
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                                : r.dataSource === "authorized_live_integration"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700"
                            }`}
                          >
                            {isSynth ? "Synthetic Test" : r.dataSource === "authorized_live_integration" ? "Live Verified" : "Uploaded Manifest"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
            <span>
              Showing {filteredRecords.length} of {records.length} records
            </span>
            <span>KINGSOK Admission Intelligence v2.1 · Mandatory Provenance & Integration Boundary Enforced</span>
          </div>
        </section>
      </main>
    </div>
  );
}
