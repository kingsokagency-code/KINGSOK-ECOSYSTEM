"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Info,
  Layers,
  Send,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lock,
  FileSpreadsheet,
  Trash2,
  Plus,
} from "lucide-react";

import ContactsNav from "@/components/ContactsNav";
import {
  ContactRecord,
  BatchInfo,
  CleaningReport,
  MessageTemplate,
  RawCsvPreview,
  ColumnMapping,
  ConsentStatus,
} from "@/lib/contacts/types";
import { normalizePhoneNumber } from "@/lib/contacts/normalizer";
import {
  processContactDataset,
  parseConsentStatus,
} from "@/lib/contacts/processor";
import {
  generateCsvPreview,
  detectColumns,
} from "@/lib/contacts/csvParser";
import {
  generateStandardContactsCsv,
  generateGoogleContactsImportCsv,
  generateDuplicatesCsv,
  generateInvalidContactsCsv,
  generateOptedOutCsv,
  triggerCsvDownload,
} from "@/lib/contacts/csvExporter";
import {
  DEFAULT_TEMPLATES,
  personalizeMessage,
  generateWhatsAppLink,
  extractFirstName,
} from "@/lib/contacts/templates";
import {
  WHATSAPP_BATCH_DISCLAIMER,
  WHATSAPP_BROADCAST_LIMIT_DEFAULT,
} from "@/lib/contacts/batching";
import { generateRealisticContactCsv } from "@/lib/contacts/sampleData";

export default function ContactsOrganizerPage() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core Dataset State
  const [allContacts, setAllContacts] = useState<ContactRecord[]>([]);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [report, setReport] = useState<CleaningReport | null>(null);

  // Configuration State
  const [batchSize, setBatchSize] = useState<number>(WHATSAPP_BROADCAST_LIMIT_DEFAULT);
  const [excludeOptedOut, setExcludeOptedOut] = useState<boolean>(true);

  // CSV Import & Preview State
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<RawCsvPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    nameColumn: "",
    phoneColumn: "",
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterValidity, setFilterValidity] = useState<"all" | "valid" | "invalid" | "duplicate">("all");
  const [filterConsent, setFilterConsent] = useState<"all" | ConsentStatus>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [filterNetwork, setFilterNetwork] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Message Assistant State
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState<string>("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<MessageTemplate["category"]>("general");
  const [newTemplateContent, setNewTemplateContent] = useState<string>("");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ----------------------------------------------------------------------------
  // Real Contacts Auto-Load on Mount
  // ----------------------------------------------------------------------------
  useEffect(() => {
    fetch("/user_contacts.csv")
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then((csv) => {
        if (csv && csv.length > 500) {
          setRawCsvText(csv);
          const preview = generateCsvPreview(csv, 5);
          setCsvPreview(preview);
          const mapping: ColumnMapping = {
            nameColumn: "First Name",
            phoneColumn: "Phone 1 - Value",
          };
          setColumnMapping(mapping);
          const result = processContactDataset(csv, mapping, {
            batchSize: WHATSAPP_BROADCAST_LIMIT_DEFAULT,
            excludeOptedOutFromBatches: true,
          });
          setAllContacts(result.allContacts);
          setBatches(result.batches);
          setReport(result.report);
          const firstValid = result.uniqueValidContacts[0];
          if (firstValid) {
            setSelectedContactId(firstValid.id);
          }
        }
      })
      .catch(() => {
        // Fallback gracefully if user_contacts.csv is not present
      });
  }, []);

  const handleLoadUserContacts = () => {
    setIsProcessing(true);
    fetch("/user_contacts.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load user_contacts.csv");
        return res.text();
      })
      .then((csv) => {
        setRawCsvText(csv);
        const preview = generateCsvPreview(csv, 5);
        setCsvPreview(preview);
        const mapping: ColumnMapping = {
          nameColumn: "First Name",
          phoneColumn: "Phone 1 - Value",
        };
        setColumnMapping(mapping);
        const result = processContactDataset(csv, mapping, {
          batchSize,
          excludeOptedOutFromBatches: excludeOptedOut,
        });
        setAllContacts(result.allContacts);
        setBatches(result.batches);
        setReport(result.report);
        const firstValid = result.uniqueValidContacts[0];
        if (firstValid) {
          setSelectedContactId(firstValid.id);
        }
        setIsProcessing(false);
        setActiveTab("dashboard");
        showToast(`Loaded your real ${result.report.totalImported.toLocaleString()} contacts! (5,755 clean unique contacts in 23 batches)`, "success");
      })
      .catch((err) => {
        setIsProcessing(false);
        showToast("Error loading file: " + err.message, "error");
      });
  };

  // ----------------------------------------------------------------------------
  // CSV Handling & Processing
  // ----------------------------------------------------------------------------

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showToast("Please upload a valid .csv file.", "error");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setRawCsvText(text);
      const preview = generateCsvPreview(text, 5);
      setCsvPreview(preview);
      setColumnMapping({
        nameColumn: preview.detectedNameCol,
        phoneColumn: preview.detectedPhoneCol,
        consentColumn: preview.detectedConsentCol,
      });
      setIsProcessing(false);
      setActiveTab("import");
      showToast(`Loaded ${preview.totalRows.toLocaleString()} rows for preview. Please confirm columns.`, "info");
    };
    reader.onerror = () => {
      setIsProcessing(false);
      showToast("Failed to read file.", "error");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleProcessDataset = (overrideText?: string, overrideMapping?: ColumnMapping) => {
    const textToProcess = overrideText || rawCsvText;
    const mappingToUse = overrideMapping || columnMapping;

    if (!textToProcess) {
      showToast("No CSV data loaded to process.", "error");
      return;
    }
    if (!mappingToUse.nameColumn || !mappingToUse.phoneColumn) {
      showToast("Please select both Name and Phone columns.", "error");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const result = processContactDataset(textToProcess, mappingToUse, {
          batchSize,
          excludeOptedOutFromBatches: excludeOptedOut,
        });

        setAllContacts(result.allContacts);
        setBatches(result.batches);
        setReport(result.report);
        setCurrentPage(1);

        // Auto-select first valid contact for message preview
        const firstValid = result.uniqueValidContacts[0];
        if (firstValid) {
          setSelectedContactId(firstValid.id);
        }

        setIsProcessing(false);
        setActiveTab("dashboard");
        showToast(
          `Successfully processed ${result.report.totalImported.toLocaleString()} contacts in ${result.report.processingTimeMs}ms!`,
          "success"
        );
      } catch (err: any) {
        setIsProcessing(false);
        showToast(`Processing error: ${err.message || "Failed to parse records"}`, "error");
      }
    }, 50);
  };

  const handleLoadSampleData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const sampleCsv = generateRealisticContactCsv(5000);
      setRawCsvText(sampleCsv);
      const preview = generateCsvPreview(sampleCsv, 5);
      setCsvPreview(preview);

      const mapping: ColumnMapping = {
        nameColumn: "Name",
        phoneColumn: "Phone 1 - Value",
        consentColumn: "Consent Status",
        notesColumn: "Notes",
      };
      setColumnMapping(mapping);

      handleProcessDataset(sampleCsv, mapping);
    }, 100);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all loaded contacts and reset?")) {
      setAllContacts([]);
      setBatches([]);
      setReport(null);
      setRawCsvText("");
      setCsvPreview(null);
      setSelectedContactId("");
      showToast("All data cleared from local memory.", "info");
    }
  };

  // Re-batch when batchSize or excludeOptedOut changes
  const handleRecalculateBatches = (newSize: number, newExcludeOptedOut: boolean) => {
    if (allContacts.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const result = processContactDataset(rawCsvText, columnMapping, {
        batchSize: newSize,
        excludeOptedOutFromBatches: newExcludeOptedOut,
      });
      setAllContacts(result.allContacts);
      setBatches(result.batches);
      setReport(result.report);
      setIsProcessing(false);
      showToast(`Re-batched into ${result.batches.length} groups of max ${newSize} contacts.`, "info");
    }, 50);
  };

  // ----------------------------------------------------------------------------
  // Consent Management
  // ----------------------------------------------------------------------------

  const handleUpdateContactConsent = (contactId: string, newStatus: ConsentStatus) => {
    setAllContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, consentStatus: newStatus } : c))
    );

    // Also update batches if opted out
    if (report) {
      setReport((prev) => {
        if (!prev) return prev;
        let optedIn = prev.optedInCount;
        let optedOut = prev.optedOutCount;
        let unknown = prev.unknownConsentCount;
        // recalculate simple tally
        return {
          ...prev,
          optedInCount: allContacts.filter((c) => (c.id === contactId ? newStatus === "opted_in" : c.consentStatus === "opted_in")).length,
          optedOutCount: allContacts.filter((c) => (c.id === contactId ? newStatus === "opted_out" : c.consentStatus === "opted_out")).length,
          unknownConsentCount: allContacts.filter((c) => (c.id === contactId ? newStatus === "unknown" : c.consentStatus === "unknown")).length,
        };
      });
    }

    showToast(`Updated consent status to "${newStatus}".`, "info");
  };

  // ----------------------------------------------------------------------------
  // Filtered & Paginated Contacts
  // ----------------------------------------------------------------------------

  const filteredContacts = useMemo(() => {
    let list = allContacts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(query) ||
          c.rawPhone.includes(query) ||
          c.normalizedPhone.includes(query) ||
          c.firstName.toLowerCase().includes(query) ||
          (c.notes && c.notes.toLowerCase().includes(query))
      );
    }

    if (filterValidity === "valid") {
      list = list.filter((c) => c.isValid && !c.isDuplicate);
    } else if (filterValidity === "invalid") {
      list = list.filter((c) => !c.isValid);
    } else if (filterValidity === "duplicate") {
      list = list.filter((c) => c.isDuplicate);
    }

    if (filterConsent !== "all") {
      list = list.filter((c) => c.consentStatus === filterConsent);
    }

    if (filterBatch !== "all") {
      const bNum = parseInt(filterBatch, 10);
      list = list.filter((c) => c.batchNumber === bNum);
    }

    if (filterNetwork !== "all") {
      list = list.filter((c) => c.network === filterNetwork);
    }

    return list;
  }, [allContacts, searchQuery, filterValidity, filterConsent, filterBatch, filterNetwork]);

  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  // ----------------------------------------------------------------------------
  // Selected Contact & Personalized Message Preview
  // ----------------------------------------------------------------------------

  const currentTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const previewContact = useMemo(() => {
    if (!selectedContactId) return allContacts[0] || null;
    return allContacts.find((c) => c.id === selectedContactId) || allContacts[0] || null;
  }, [allContacts, selectedContactId]);

  const personalizedPreview = useMemo(() => {
    return personalizeMessage(currentTemplate.content, previewContact);
  }, [currentTemplate, previewContact]);

  const handleCopyPersonalizedMessage = () => {
    navigator.clipboard.writeText(personalizedPreview);
    showToast("Personalized message copied to clipboard!", "success");
  };

  const handleSaveCustomTemplate = () => {
    if (!newTemplateTitle.trim() || !newTemplateContent.trim()) {
      showToast("Please provide both a title and message content.", "error");
      return;
    }

    const newTmpl: MessageTemplate = {
      id: `tmpl-${Date.now().toString(36)}`,
      title: newTemplateTitle.trim(),
      category: newTemplateCategory,
      description: "Custom user message template",
      content: newTemplateContent.trim(),
      createdAt: new Date().toISOString(),
      isSystem: false,
    };

    setTemplates((prev) => [newTmpl, ...prev]);
    setSelectedTemplateId(newTmpl.id);
    setIsCreatingTemplate(false);
    setNewTemplateTitle("");
    setNewTemplateContent("");
    showToast("New message template created!", "success");
  };

  const handleDeleteTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl?.isSystem) {
      showToast("System templates cannot be deleted.", "error");
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(DEFAULT_TEMPLATES[0].id);
    }
    showToast("Template removed.", "info");
  };

  // ----------------------------------------------------------------------------
  // Bulk Exports
  // ----------------------------------------------------------------------------

  const handleDownloadBatch = (batch: BatchInfo, format: "standard" | "google") => {
    if (format === "google") {
      const csv = generateGoogleContactsImportCsv(batch.contacts, `KINGSOK_${batch.batchName.replace(/\s+/g, "_")}`);
      triggerCsvDownload(`KINGSOK_${batch.batchName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Google_Contacts.csv`, csv);
    } else {
      const csv = generateStandardContactsCsv(batch.contacts);
      triggerCsvDownload(`KINGSOK_${batch.batchName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Standard.csv`, csv);
    }
    showToast(`Downloaded ${batch.batchName} (${batch.count} contacts)`, "success");
  };

  const handleDownloadAllBatches = () => {
    if (batches.length === 0) {
      showToast("No batches to download.", "error");
      return;
    }

    // Download sequentially with small timeout to allow browser download prompts
    batches.forEach((b, idx) => {
      setTimeout(() => {
        const csv = generateStandardContactsCsv(b.contacts);
        triggerCsvDownload(`KINGSOK_Batch_${String(b.batchNumber).padStart(2, "0")}.csv`, csv);
      }, idx * 250);
    });

    showToast(`Downloading all ${batches.length} batch CSV files...`, "success");
  };

  const handleExportUniqueMaster = () => {
    const uniqueValid = allContacts.filter((c) => c.isValid && !c.isDuplicate && (excludeOptedOut ? c.consentStatus !== "opted_out" : true));
    const csv = generateStandardContactsCsv(uniqueValid);
    triggerCsvDownload("KINGSOK_Cleaned_Unique_Contacts_Master.csv", csv);
    showToast(`Exported ${uniqueValid.length.toLocaleString()} clean unique contacts.`, "success");
  };

  const handleExportDuplicates = () => {
    const csv = generateDuplicatesCsv(allContacts);
    triggerCsvDownload("KINGSOK_Duplicate_Contacts_Audit.csv", csv);
    showToast("Exported duplicates list for review.", "info");
  };

  const handleExportInvalid = () => {
    const csv = generateInvalidContactsCsv(allContacts);
    triggerCsvDownload("KINGSOK_Invalid_Numbers_Report.csv", csv);
    showToast("Exported invalid numbers list.", "info");
  };

  const handleExportOptedOut = () => {
    const csv = generateOptedOutCsv(allContacts);
    triggerCsvDownload("KINGSOK_Opted_Out_Suppression_List.csv", csv);
    showToast("Exported opted-out suppression list.", "info");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <ContactsNav
        totalContacts={allContacts.length}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce transition-all">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-950 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40"
                : toast.type === "error"
                ? "bg-rose-950 text-rose-200 border-rose-500/50 shadow-rose-950/40"
                : "bg-neutral-900 text-neutral-200 border-neutral-700 shadow-black/50"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-sky-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Quick Operational Action Bar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 flex items-center justify-center text-white font-bold shadow-md">
              KS
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                KINGSOK Contact Organizer & Messaging Assistant
              </h1>
              <p className="text-xs text-neutral-400">
                Local-only Nigerian (+234) number normalizer, deduplication engine, 256-broadcast batcher & personalized template manager
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleLoadUserContacts}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50"
              title="Load your real 5,970 contacts exported from phone"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Load My 5,970 Real Contacts</span>
              <span className="bg-emerald-900/80 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded border border-emerald-400/40">
                READY
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-all"
              title="Upload another contacts CSV file"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />

            <button
              onClick={handleLoadSampleData}
              disabled={isProcessing}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-800 transition-all"
              title="Switch to demo test dataset"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Mode</span>
            </button>

            {allContacts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 transition-all"
                title="Clear current dataset from memory"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Total Imported */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Total Imported</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {report ? report.totalImported.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Raw phone records</div>
              </div>

              {/* Card 2: Unique Valid */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-emerald-300 mb-2">
                  <span className="text-xs font-medium">Unique Valid</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-300">
                  {report ? report.uniqueValidCount.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-emerald-500/80 mt-1">Clean & batch-ready</div>
              </div>

              {/* Card 3: Duplicates */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Duplicates</span>
                  <Copy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400">
                  {report ? report.duplicateCount.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Safely deduplicated</div>
              </div>

              {/* Card 4: Valid Numbers */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Valid Numbers</span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {report ? report.validCount.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">+234 / E.164 verified</div>
              </div>

              {/* Card 5: Invalid / Ambiguous */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Invalid Numbers</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-extrabold text-rose-400">
                  {report ? report.invalidCount.toLocaleString() : "0"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Flagged, zero guessing</div>
              </div>

              {/* Card 6: Batches Created */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-medium">Batches (max {batchSize})</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  {report ? report.totalBatches : "0"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Sequential CSV splits</div>
              </div>
            </div>

            {/* Crucial Educational Notice on WhatsApp Broadcasts */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-950 border border-emerald-500/40 rounded-2xl p-5 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">
                      Understanding WhatsApp Broadcast Lists vs. Organizational Batches
                    </h2>
                    <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                      ANTI-BAN POLICY
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    <strong>These batches are organizational divisions</strong> designed to structure your contact book into manageable groups of 256. They are <em>not</em> automatically injected into WhatsApp.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-neutral-400">
                    <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                      <span className="font-semibold text-emerald-400 block mb-1">1. Recipient Address Book Rule</span>
                      WhatsApp broadcast messages will <strong>only deliver</strong> if the recipient has your official phone number saved in their personal address book.
                    </div>
                    <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                      <span className="font-semibold text-emerald-400 block mb-1">2. 256 Member List Cap</span>
                      Official WhatsApp enforces a hard limit of 256 contacts per broadcast list. Each generated batch maps directly to one broadcast list.
                    </div>
                    <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                      <span className="font-semibold text-emerald-400 block mb-1">3. Zero Bot Automation</span>
                      Never use unauthorized bot scripts or unofficial WhatsApp Web auto-senders. Doing so will permanently ban your phone number.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Breakdown Card */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Consent & Opt-Out Status Distribution</span>
                    <span className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                      Privacy Rule: Phone ≠ Consent
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Never assume an imported phone contact has consented to marketing. Opted-out contacts are automatically excluded from export batches.
                  </p>
                </div>

                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("compliance");
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <span>Manage Policies</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
                      Opted In
                    </span>
                    <span className="text-xl font-bold text-white">
                      {report ? report.optedInCount.toLocaleString() : "0"}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-1 rounded-lg">
                    {report && report.totalImported > 0
                      ? `${((report.optedInCount / report.totalImported) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
                      Unknown / Unconfirmed
                    </span>
                    <span className="text-xl font-bold text-white">
                      {report ? report.unknownConsentCount.toLocaleString() : "0"}
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-1 rounded-lg">
                    {report && report.totalImported > 0
                      ? `${((report.unknownConsentCount / report.totalImported) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider block">
                      Opted Out (Suppressed)
                    </span>
                    <span className="text-xl font-bold text-rose-400">
                      {report ? report.optedOutCount.toLocaleString() : "0"}
                    </span>
                  </div>
                  <span className="text-xs text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2 py-1 rounded-lg">
                    {report && report.totalImported > 0
                      ? `${((report.optedOutCount / report.totalImported) * 100).toFixed(1)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Launch Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab("directory")}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Contacts Directory & Normalization
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Search, filter, view carrier tags (MTN, Airtel, Glo, 9mobile), and audit invalid or duplicate records.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-3">
                  Open Directory <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("batches")}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  WhatsApp Batches & Google Export
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Download each 256-sized batch as a separate CSV or export Google Contacts Android-ready files.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-3">
                  View Batches <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("messages")}
                className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Message Templates & Live Preview
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Prepare KINGSOK ACCOMMODATIONS & UNN admission updates with name personalization and wa.me links.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-3">
                  Launch Assistant <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: IMPORT & COLUMN MAPPING */}
        {/* ========================================================================= */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span>Upload Android or Phone Contact Export (CSV)</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Accepts Google Contacts CSV, Android Phone exports, or custom spreadsheets with contact names and phone numbers.
                  </p>
                </div>

                <button
                  onClick={handleLoadSampleData}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use 5,000 Demo Contacts</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-950/20"
                    : "border-neutral-700 hover:border-neutral-500 bg-neutral-950/50"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-inner">
                  <Upload className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Drag & Drop your phone contacts CSV file here, or{" "}
                  <span className="text-emerald-400 underline">browse files</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Handles over 5,000+ records in milliseconds entirely in your browser memory.
                </p>
              </div>

              {/* File Preview & Column Mapping Section */}
              {csvPreview && (
                <div className="space-y-5 pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Confirm Column Mapping ({csvPreview.totalRows.toLocaleString()} Rows Found)</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Verify which CSV columns contain the contact name and phone number before cleaning.
                      </p>
                    </div>

                    <button
                      onClick={() => handleProcessDataset()}
                      disabled={isProcessing || !columnMapping.nameColumn || !columnMapping.phoneColumn}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Cleaning & Batching...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Process All Contacts</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dropdown Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div>
                      <label className="text-xs font-semibold text-emerald-400 block mb-1.5">
                        * Name Column
                      </label>
                      <select
                        value={columnMapping.nameColumn}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, nameColumn: e.target.value }))
                        }
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Select column...</option>
                        {csvPreview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-emerald-400 block mb-1.5">
                        * Phone Number Column
                      </label>
                      <select
                        value={columnMapping.phoneColumn}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, phoneColumn: e.target.value }))
                        }
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Select column...</option>
                        {csvPreview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                        Consent Column (Optional)
                      </label>
                      <select
                        value={columnMapping.consentColumn || ""}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, consentColumn: e.target.value || undefined }))
                        }
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Default to "Unknown" (Recommended)</option>
                        {csvPreview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                        Notes / Lodge Inquiry (Optional)
                      </label>
                      <select
                        value={columnMapping.notesColumn || ""}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, notesColumn: e.target.value || undefined }))
                        }
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">None</option>
                        {csvPreview.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sample Rows Table Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-neutral-400">
                      Sample Preview (First {csvPreview.sampleRows.length} rows):
                    </span>
                    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                          <tr>
                            {csvPreview.headers.slice(0, 7).map((h) => (
                              <th
                                key={h}
                                className={`px-3 py-2.5 font-semibold ${
                                  h === columnMapping.nameColumn || h === columnMapping.phoneColumn
                                    ? "text-emerald-400 bg-emerald-950/40"
                                    : ""
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 text-neutral-300 font-mono">
                          {csvPreview.sampleRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-neutral-900/50">
                              {csvPreview.headers.slice(0, 7).map((h) => (
                                <td key={h} className="px-3 py-2 whitespace-nowrap">
                                  {row[h] || <span className="text-neutral-600">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CONTACTS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === "directory" && (
          <div className="space-y-4">
            {/* Filter and Search Toolbar */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search contacts by name, local number (0803...), or international (+234)..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Counter Badge */}
                <div className="text-xs text-neutral-400 whitespace-nowrap">
                  Showing <strong className="text-white">{filteredContacts.length.toLocaleString()}</strong> of{" "}
                  {allContacts.length.toLocaleString()} contacts
                </div>
              </div>

              {/* Multi-facet Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/60 text-xs">
                {/* Validity Filter */}
                <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 text-[11px]">Validity:</span>
                  <select
                    value={filterValidity}
                    onChange={(e) => {
                      setFilterValidity(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  >
                    <option value="all">All Records</option>
                    <option value="valid">Valid & Unique Only</option>
                    <option value="invalid">Invalid / Ambiguous</option>
                    <option value="duplicate">Duplicates</option>
                  </select>
                </div>

                {/* Consent Filter */}
                <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 text-[11px]">Consent:</span>
                  <select
                    value={filterConsent}
                    onChange={(e) => {
                      setFilterConsent(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  >
                    <option value="all">All Consents</option>
                    <option value="opted_in">Opted In</option>
                    <option value="unknown">Unknown</option>
                    <option value="opted_out">Opted Out</option>
                  </select>
                </div>

                {/* Batch Filter */}
                {batches.length > 0 && (
                  <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 text-[11px]">Batch:</span>
                    <select
                      value={filterBatch}
                      onChange={(e) => {
                        setFilterBatch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-white text-xs focus:outline-none"
                    >
                      <option value="all">All Batches</option>
                      {batches.map((b) => (
                        <option key={b.batchNumber} value={b.batchNumber.toString()}>
                          {b.batchName} ({b.count})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Network Filter */}
                <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 text-[11px]">Network:</span>
                  <select
                    value={filterNetwork}
                    onChange={(e) => {
                      setFilterNetwork(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  >
                    <option value="all">All Networks</option>
                    <option value="MTN">MTN</option>
                    <option value="Airtel">Airtel</option>
                    <option value="Glo">Glo</option>
                    <option value="9mobile">9mobile</option>
                    <option value="International">International</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                {/* Page Size */}
                <div className="ml-auto flex items-center gap-1 text-[11px] text-neutral-400">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-white"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">Contact Name</th>
                      <th className="px-4 py-3 font-semibold">Phone Number</th>
                      <th className="px-4 py-3 font-semibold">Normalized (+234)</th>
                      <th className="px-4 py-3 font-semibold">Network</th>
                      <th className="px-4 py-3 font-semibold">Status / Issue</th>
                      <th className="px-4 py-3 font-semibold">Consent</th>
                      <th className="px-4 py-3 font-semibold">Batch</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                    {paginatedContacts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-neutral-500">
                          {allContacts.length === 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-neutral-400">No contacts loaded yet.</p>
                              <button
                                onClick={handleLoadSampleData}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                              >
                                Load 5,000 Demo Contacts
                              </button>
                            </div>
                          ) : (
                            "No contacts matched your search and filter criteria."
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedContacts.map((contact, idx) => {
                        const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <tr
                            key={contact.id}
                            className={`hover:bg-neutral-800/40 transition-colors ${
                              contact.isDuplicate
                                ? "bg-amber-950/10 text-neutral-400"
                                : !contact.isValid
                                ? "bg-rose-950/15"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-3 text-neutral-500 font-mono">{globalIdx}</td>
                            <td className="px-4 py-3 font-medium text-white">
                              <div>{contact.displayName}</div>
                              {contact.firstName && contact.firstName !== contact.displayName && (
                                <span className="text-[10px] text-neutral-400">
                                  Hi, {contact.firstName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-neutral-300">
                              {contact.rawPhone || "—"}
                            </td>
                            <td className="px-4 py-3 font-mono">
                              {contact.normalizedPhone ? (
                                <span className="text-emerald-300 font-semibold">
                                  {contact.displayPhone || contact.normalizedPhone}
                                </span>
                              ) : (
                                <span className="text-rose-400 italic">Invalid</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {contact.network === "MTN" && (
                                <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  MTN
                                </span>
                              )}
                              {contact.network === "Airtel" && (
                                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Airtel
                                </span>
                              )}
                              {contact.network === "Glo" && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Glo
                                </span>
                              )}
                              {contact.network === "9mobile" && (
                                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  9mobile
                                </span>
                              )}
                              {contact.network === "International" && (
                                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Intl
                                </span>
                              )}
                              {contact.network === "Unknown" && (
                                <span className="text-neutral-500 text-[10px]">Unknown</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {contact.isValid && !contact.isDuplicate && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" /> Valid
                                </span>
                              )}
                              {contact.isDuplicate && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                                  <Copy className="w-3 h-3" /> Duplicate
                                </span>
                              )}
                              {!contact.isValid && (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded"
                                  title={contact.validationReason}
                                >
                                  <AlertTriangle className="w-3 h-3" /> {contact.validationReason}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={contact.consentStatus}
                                onChange={(e) =>
                                  handleUpdateContactConsent(contact.id, e.target.value as ConsentStatus)
                                }
                                className={`text-[11px] font-medium rounded px-2 py-1 border focus:outline-none cursor-pointer ${
                                  contact.consentStatus === "opted_in"
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                                    : contact.consentStatus === "opted_out"
                                    ? "bg-rose-950 text-rose-300 border-rose-500/40"
                                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                                }`}
                              >
                                <option value="unknown">Unknown</option>
                                <option value="opted_in">Opted In</option>
                                <option value="opted_out">Opted Out</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              {contact.batchName ? (
                                <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[11px] font-mono">
                                  {contact.batchName.split(" ")[0]} {contact.batchName.split(" ")[1]}
                                </span>
                              ) : (
                                <span className="text-neutral-500 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {contact.isValid && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedContactId(contact.id);
                                      setActiveTab("messages");
                                    }}
                                    className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 rounded-lg transition-colors"
                                    title="Personalize template for this contact"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  {contact.e164Digits && (
                                    <a
                                      href={generateWhatsAppLink(
                                        contact.e164Digits,
                                        `Good day ${contact.firstName}, this is KINGSOK ECOSYSTEM.`
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 hover:bg-emerald-950 text-emerald-400 rounded-lg transition-colors"
                                      title="Open safe direct 1-on-1 WhatsApp chat"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div>
                    Page <strong className="text-white">{currentPage}</strong> of{" "}
                    <strong className="text-white">{totalPages}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: BATCHES & EXPORTS */}
        {/* ========================================================================= */}
        {activeTab === "batches" && (
          <div className="space-y-6">
            {/* Batch Controls Banner */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp Organizational Batches ({batches.length} Lists Created)</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Organize clean, verified contacts into numbered batches matching WhatsApp's standard broadcast capacity of 256.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadAllBatches}
                    disabled={batches.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All {batches.length} Batch CSVs</span>
                  </button>

                  <button
                    onClick={handleExportUniqueMaster}
                    disabled={allContacts.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 border border-neutral-700 transition-all disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Clean Master CSV</span>
                  </button>
                </div>
              </div>

              {/* Batch Configuration Form */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-neutral-400">Batch Size:</label>
                  <select
                    value={batchSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setBatchSize(newSize);
                      handleRecalculateBatches(newSize, excludeOptedOut);
                    }}
                    className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={256}>256 (Official WhatsApp Broadcast Limit)</option>
                    <option value={100}>100 (Compact Outreach Batch)</option>
                    <option value={50}>50 (Direct VIP Batch)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeOptedOut}
                    onChange={(e) => {
                      const newExclude = e.target.checked;
                      setExcludeOptedOut(newExclude);
                      handleRecalculateBatches(batchSize, newExclude);
                    }}
                    className="rounded bg-neutral-950 border-neutral-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Exclude Opted-Out Contacts from Batches (Mandatory for Compliance)</span>
                </label>
              </div>
            </div>

            {/* Batches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.length === 0 ? (
                <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500 space-y-3">
                  <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-sm font-medium text-neutral-400">No batches generated yet.</p>
                  <button
                    onClick={handleLoadSampleData}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Generate Sample Batches with 5,000 Contacts
                  </button>
                </div>
              ) : (
                batches.map((batch) => {
                  const optedIn = batch.contacts.filter((c) => c.consentStatus === "opted_in").length;
                  const unknown = batch.contacts.filter((c) => c.consentStatus === "unknown").length;

                  return (
                    <div
                      key={batch.batchNumber}
                      className="bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">
                              {batch.batchNumber}
                            </span>
                            <h3 className="text-sm font-bold text-white">{batch.batchName}</h3>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            Contacts {batch.startIndex.toLocaleString()} – {batch.endIndex.toLocaleString()}
                          </p>
                        </div>

                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          {batch.count} / {batchSize}
                        </span>
                      </div>

                      {/* Consent Micro-meter */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-neutral-400">
                          <span>Consent Split</span>
                          <span>
                            <strong className="text-emerald-400">{optedIn} Opted In</strong> · {unknown} Unknown
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden flex">
                          <div
                            style={{ width: `${(optedIn / batch.count) * 100}%` }}
                            className="bg-emerald-500"
                          />
                          <div
                            style={{ width: `${(unknown / batch.count) * 100}%` }}
                            className="bg-amber-500"
                          />
                        </div>
                      </div>

                      {/* Download Buttons for this batch */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
                        <button
                          onClick={() => handleDownloadBatch(batch, "standard")}
                          className="px-2.5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
                          title="Download standard CSV with name, phone, E.164"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Standard CSV</span>
                        </button>

                        <button
                          onClick={() => handleDownloadBatch(batch, "google")}
                          className="px-2.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                          title="Download Google Contacts CSV with automatic group tag for instant Android import"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Import</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Specialized Audit Exports */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Specialized Audit & Compliance Exports</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Download isolated reports for compliance verification, audit trails, and number hygiene.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={handleExportDuplicates}
                  disabled={!report || report.duplicateCount === 0}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-300 text-xs font-medium border border-neutral-800 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Duplicates ({report?.duplicateCount || 0})</span>
                </button>

                <button
                  onClick={handleExportInvalid}
                  disabled={!report || report.invalidCount === 0}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-rose-300 text-xs font-medium border border-neutral-800 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Export Invalid Numbers ({report?.invalidCount || 0})</span>
                </button>

                <button
                  onClick={handleExportOptedOut}
                  disabled={!report || report.optedOutCount === 0}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Export Suppression List ({report?.optedOutCount || 0})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: MESSAGE ASSISTANT & LIVE PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Template Selector & Editor (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Message Templates</span>
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Select an official KINGSOK template or draft your own personalized copy.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isCreatingTemplate ? "Cancel" : "New Template"}</span>
                    </button>
                  </div>

                  {/* Create New Template Form */}
                  {isCreatingTemplate && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                      <h3 className="text-xs font-bold text-white">Create Custom Template</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newTemplateTitle}
                          onChange={(e) => setNewTemplateTitle(e.target.value)}
                          placeholder="Template Title (e.g. UNN Lodge Inspection Notice)"
                          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <select
                          value={newTemplateCategory}
                          onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="accommodation">Accommodation</option>
                          <option value="admission">UNN Admission</option>
                          <option value="consent">Consent / Opt-in</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <textarea
                        rows={6}
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                        placeholder="Draft your message. Use {{first_name}}, {{name}}, {{phone}}, and {{batch}} for personalization. Always include 'Reply STOP to opt out'."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <span>Tags:</span>
                          <button
                            type="button"
                            onClick={() => setNewTemplateContent((c) => c + " {{first_name}}")}
                            className="bg-neutral-800 text-emerald-400 px-1.5 py-0.5 rounded"
                          >
                            {"{{first_name}}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTemplateContent((c) => c + " {{name}}")}
                            className="bg-neutral-800 text-emerald-400 px-1.5 py-0.5 rounded"
                          >
                            {"{{name}}"}
                          </button>
                        </div>

                        <button
                          onClick={handleSaveCustomTemplate}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Save Template
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Template Picker List */}
                  <div className="space-y-2">
                    {templates.map((tmpl) => {
                      const isSelected = tmpl.id === selectedTemplateId;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setSelectedTemplateId(tmpl.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-950/40 border-emerald-500 text-white"
                              : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white">{tmpl.title}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-neutral-900 text-neutral-400 border border-neutral-800">
                                  {tmpl.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 line-clamp-1">{tmpl.description}</p>
                            </div>

                            {!tmpl.isSystem && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(tmpl.id);
                                }}
                                className="text-neutral-500 hover:text-rose-400 p-1"
                                title="Delete custom template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Contact Preview & WhatsApp Simulator (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Live WhatsApp Preview</span>
                    </h3>
                    <span className="text-[11px] text-neutral-400">Personalized Simulator</span>
                  </div>

                  {/* Contact Picker for Live Preview */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 block mb-1.5">
                      Preview Against Contact:
                    </label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {allContacts.length === 0 ? (
                        <option value="">No contacts loaded (showing sample)</option>
                      ) : (
                        allContacts.slice(0, 100).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.displayName} ({c.displayPhone || c.rawPhone})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* WhatsApp Chat Bubble Simulator */}
                  <div className="bg-[#0b141a] rounded-2xl p-4 border border-neutral-800 space-y-3 font-sans shadow-inner">
                    {/* Fake WhatsApp Header */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                          KS
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">KINGSOK Official</span>
                          <span className="text-[10px] text-emerald-400 block">Verified Business</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500">Today</span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="flex justify-end">
                      <div className="max-w-[92%] bg-[#005c4b] text-[#e9edef] rounded-xl rounded-tr-none p-3 shadow-md text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {personalizedPreview}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                          <span>11:45 AM</span>
                          <span className="text-sky-400 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleCopyPersonalizedMessage}
                      className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-neutral-700"
                    >
                      <Copy className="w-4 h-4 text-emerald-400" />
                      <span>Copy Personalized Message to Clipboard</span>
                    </button>

                    {previewContact && previewContact.e164Digits ? (
                      <a
                        href={generateWhatsAppLink(previewContact.e164Digits, personalizedPreview)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
                      >
                        <Send className="w-4 h-4 text-white" />
                        <span>Send to {previewContact.firstName || "Contact"} via WhatsApp (wa.me)</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-neutral-900 text-neutral-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed border border-neutral-800"
                      >
                        <Send className="w-4 h-4" />
                        <span>Select contact with valid number to launch wa.me</span>
                      </button>
                    )}
                  </div>

                  {/* Manual Dispatch Notice */}
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Manual Safety Standard:</strong> KINGSOK operates on compliant manual dispatch. Use the copy button or individual click-to-chat links to communicate safely without triggering WhatsApp automated spam filters.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: CONSENT & POLICY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>KINGSOK Consent & Ethical Messaging Policy</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Responsible contact management guidelines aligned with WhatsApp Terms of Service and Nigerian data privacy regulations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Level 1: Explicit Opt-In
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Recipients who specifically requested accommodation assistance or admission screening alerts via form, WhatsApp reply, or in-person desk signup.
                  </p>
                  <span className="text-[11px] text-emerald-500 block">✓ 100% Eligible for promotional broadcasts</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Level 2: Unknown / Unconfirmed
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Contacts exported from phone address books whose explicit consent for mass updates has not yet been collected.
                  </p>
                  <span className="text-[11px] text-amber-400/90 block">⚠️ Send opt-in / contact-save confirmation first</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    Level 3: Opted Out (Suppressed)
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Contacts who replied STOP, unsubscribe, or asked to be removed. Must be immediately suppressed from future promotional batches.
                  </p>
                  <span className="text-[11px] text-rose-400 block">🛑 Automatically excluded from batch CSVs</span>
                </div>
              </div>

              {/* Action Rules */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-bold text-white">Ethical Outreach Recommendations:</h3>
                <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong>Never blast unsolicited promotions:</strong> Send the <em>KINGSOK Contact Save & Subscription Confirmation</em> template first.
                  </li>
                  <li>
                    <strong>Respect STOP replies instantly:</strong> When a recipient replies STOP, locate their record in the directory and switch their status to <em>Opted Out</em>.
                  </li>
                  <li>
                    <strong>Identify sender identity clearly:</strong> Always state <em>KINGSOK ACCOMMODATIONS</em> or <em>KINGSOK ENTERPRISES</em> in the opening line.
                  </li>
                  <li>
                    <strong>Avoid rapid copy-pasting:</strong> Pace any manual messages to mimic natural human typing behavior to protect your phone number health.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleExportOptedOut}
                  disabled={!report || report.optedOutCount === 0}
                  className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-2 transition-all disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Opted-Out Suppression List</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">KINGSOK ECOSYSTEM</span>
            <span>·</span>
            <span>Contact Organizer & Messaging Assistant</span>
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-3">
            <span>Client-side Processing</span>
            <span>·</span>
            <span>Nigerian E.164 Standards</span>
            <span>·</span>
            <span>UNN Student Welfare</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
