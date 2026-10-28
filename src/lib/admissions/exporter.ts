/**
 * KINGSOK Admission Intelligence System - Excel & CSV Exporter
 * Generates verified source-aware exports for:
 * 1. UTME Admissions
 * 2. Direct Entry (DE) Admissions
 * 3. Combined Results (preserving Admission Type & Data Source on every row)
 * 4. Flagged for Review Audit Report
 *
 * Task 1 & 2: Includes required Data Source provenance and prominent
 * synthetic test data warning banners to prevent accidental operational use.
 */

import { CandidateAdmissionRecord, RecordDataSource } from './types';

/**
 * Format Data Source for Display
 */
export function formatDataSourceLabel(source: RecordDataSource): string {
  switch (source) {
    case 'synthetic':
      return 'SYNTHETIC (TEST DATA - NOT FOR OPERATIONAL USE)';
    case 'uploaded_manifest':
      return 'UPLOADED MANIFEST';
    case 'authorized_live_integration':
      return 'AUTHORIZED LIVE INTEGRATION';
    default:
      return 'UNVERIFIED SOURCE';
  }
}

/**
 * Escape a cell value for standard CSV / Excel compatibility
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Format records into Excel-compatible CSV with UTF-8 BOM and Source Provenance
 */
export function generateAdmissionsCsv(
  records: CandidateAdmissionRecord[],
  options: {
    includeReviewReason?: boolean;
    forceSyntheticWarning?: boolean;
  } = {}
): string {
  const { includeReviewReason = true, forceSyntheticWarning = false } = options;

  const isSynthetic = forceSyntheticWarning || records.some((r) => r.dataSource === 'synthetic');

  const headers = [
    'JAMB Registration Number',
    'Candidate Full Name',
    'Department',
    'Phone Number',
    'Admission Type',
    'Processing Status',
    'Data Source', // Task 1 & 3: Mandatory Provenance
  ];

  if (includeReviewReason) {
    headers.push('Review Notes / Diagnostic Message');
  }

  const rows: string[] = [];

  // UTF-8 BOM so Excel opens accented characters and symbols without mojibake
  const BOM = '\uFEFF';

  // Task 2: Prominent warning header if dataset contains synthetic data
  if (isSynthetic) {
    rows.push('# ==============================================================================');
    rows.push('# WARNING: TEST DATA — NOT FOR OPERATIONAL USE');
    rows.push('# THIS FILE CONTAINS SYNTHETIC TEST RECORDS FOR SIMULATION & AUDITING PURPOSES.');
    rows.push('# DO NOT USE FOR OPERATIONAL OUTREACH OR INSTITUTIONAL CLEARANCE.');
    rows.push('# ==============================================================================');
  }

  rows.push(headers.map(escapeCsvCell).join(','));

  for (const r of records) {
    const row = [
      escapeCsvCell(r.jambRegNumber),
      escapeCsvCell(r.candidateName),
      escapeCsvCell(r.department),
      escapeCsvCell(r.phoneNumber),
      escapeCsvCell(r.admissionType),
      escapeCsvCell(r.status.toUpperCase().replace('_', ' ')),
      escapeCsvCell(formatDataSourceLabel(r.dataSource)),
    ];

    if (includeReviewReason) {
      row.push(escapeCsvCell(r.reviewReason || r.statusMessage));
    }

    rows.push(row.join(','));
  }

  return BOM + rows.join('\r\n');
}

/**
 * Export UTME Admissions List
 */
export function generateUtmeExportCsv(records: CandidateAdmissionRecord[]): string {
  const utmeRecords = records.filter((r) => r.admissionType === 'UTME');
  return generateAdmissionsCsv(utmeRecords);
}

/**
 * Export Direct Entry Admissions List
 */
export function generateDirectEntryExportCsv(records: CandidateAdmissionRecord[]): string {
  const deRecords = records.filter((r) => r.admissionType === 'Direct Entry');
  return generateAdmissionsCsv(deRecords);
}

/**
 * Export Combined Admissions List (Retains Admission Type & Provenance on every single record)
 */
export function generateCombinedExportCsv(records: CandidateAdmissionRecord[]): string {
  return generateAdmissionsCsv(records);
}

/**
 * Export Flagged for Review Records
 */
export function generateFlaggedForReviewCsv(records: CandidateAdmissionRecord[]): string {
  const flagged = records.filter((r) => r.status === 'flagged_review' || r.isCrossCategoryDuplicate);
  return generateAdmissionsCsv(flagged);
}

/**
 * Resolve filename to prepend SYNTHETIC_TEST_ if records contain synthetic data
 */
export function resolveExportFilename(baseFilename: string, records: CandidateAdmissionRecord[]): string {
  const hasSynthetic = records.some((r) => r.dataSource === 'synthetic');
  if (hasSynthetic && !baseFilename.startsWith('SYNTHETIC_TEST_')) {
    return `SYNTHETIC_TEST_${baseFilename}`;
  }
  return baseFilename;
}

/**
 * Trigger file download in client browser with synthetic filename protection
 */
export function triggerAdmissionDownload(
  csvContent: string,
  filename: string,
  records?: CandidateAdmissionRecord[]
): void {
  if (typeof window === 'undefined') return;

  const resolvedName = records ? resolveExportFilename(filename, records) : filename;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', resolvedName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
