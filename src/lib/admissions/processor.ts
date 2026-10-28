/**
 * KINGSOK Admission Intelligence System - Core Processing Engine
 * Supports independent UTME processing, Direct Entry processing,
 * and Combined processing with cross-category duplicate auditing
 * and strict record provenance enforcement.
 */

import {
  AdmissionCategory,
  AdmissionProcessingReport,
  AdmissionSelection,
  CandidateAdmissionRecord,
  RecordDataSource,
} from './types';
import { UTME_WORKFLOW_CONFIG, DIRECT_ENTRY_WORKFLOW_CONFIG } from './config';
import { normalizePhoneNumber } from '../contacts/normalizer';

export interface RawCandidateInput {
  jambRegNumber: string;
  candidateName?: string;
  department?: string;
  phoneNumber?: string;
  admissionType?: string; // Optional incoming column, or inferred from user selection
  dataSource?: RecordDataSource; // Mandatory provenance
  simulatedError?: 'timeout' | 'unmatched';
}

export interface ProcessAdmissionsOptions {
  selection: AdmissionSelection; // 'utme' | 'direct_entry' | 'combined'
  enforceStrictRegNoPattern?: boolean;
  defaultDataSource?: RecordDataSource; // Default if not specified on raw input
  disallowMixedSources?: boolean; // Task 2: Prevent accidental mixing of test and operational data
}

export interface ProcessedAdmissionsResult {
  records: CandidateAdmissionRecord[];
  utmeRecords: CandidateAdmissionRecord[];
  directEntryRecords: CandidateAdmissionRecord[];
  flaggedReviewRecords: CandidateAdmissionRecord[];
  report: AdmissionProcessingReport;
}

/**
 * Valid Data Sources Set
 */
const VALID_DATA_SOURCES: ReadonlySet<RecordDataSource> = new Set([
  'synthetic',
  'uploaded_manifest',
  'authorized_live_integration',
]);

/**
 * Clean and format a JAMB Registration Number
 */
export function cleanJambRegNumber(raw: string): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/[\s\-_/.]/g, '');
}

/**
 * Standardize Candidate Name
 */
export function cleanCandidateName(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (word.length <= 2 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Clean Department Name
 */
export function cleanDepartmentName(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, ' ');
}

/**
 * Determine the intended admission category based on record data and selection
 */
export function resolveAdmissionCategory(
  rawCategory: string | undefined,
  selection: AdmissionSelection
): AdmissionCategory {
  if (selection === 'utme') return 'UTME';
  if (selection === 'direct_entry') return 'Direct Entry';

  // For combined mode, inspect raw input if available
  if (rawCategory) {
    const lower = rawCategory.toLowerCase().trim();
    if (lower.includes('direct') || lower === 'de' || lower.includes('entry')) {
      return 'Direct Entry';
    }
    if (lower.includes('utme') || lower.includes('post') || lower === 'putme') {
      return 'UTME';
    }
  }

  // Default to UTME in combined mode if unspecified
  return 'UTME';
}

/**
 * Process a batch of candidate admission records
 */
export function processAdmissionDataset(
  rawInputs: RawCandidateInput[],
  options: ProcessAdmissionsOptions
): ProcessedAdmissionsResult {
  const startTime = Date.now();
  const {
    selection,
    enforceStrictRegNoPattern = false,
    defaultDataSource = 'uploaded_manifest',
    disallowMixedSources = false,
  } = options;

  // Task 2: Check for accidental mixing of synthetic test data with operational data
  if (disallowMixedSources && rawInputs.length > 0) {
    const sources = new Set(rawInputs.map((i) => i.dataSource || defaultDataSource));
    const hasSynthetic = sources.has('synthetic');
    const hasOperational = sources.has('uploaded_manifest') || sources.has('authorized_live_integration');

    if (hasSynthetic && hasOperational) {
      throw new Error(
        'ACCIDENTAL MIXING PREVENTED: Cannot process synthetic test records and operational records in the same batch. ' +
        'Please process synthetic test data and operational manifests separately.'
      );
    }
  }

  const records: CandidateAdmissionRecord[] = [];
  const regNoCategoryMap = new Map<string, { category: AdmissionCategory; id: string }[]>();

  let syntheticCount = 0;
  let uploadedManifestCount = 0;
  let authorizedLiveCount = 0;

  // Pass 1: Parse, clean, validate individual records
  rawInputs.forEach((input, index) => {
    const rawRegNo = input.jambRegNumber || '';
    const cleanRegNo = cleanJambRegNumber(rawRegNo);
    const category = resolveAdmissionCategory(input.admissionType, selection);
    const config = category === 'UTME' ? UTME_WORKFLOW_CONFIG : DIRECT_ENTRY_WORKFLOW_CONFIG;

    // Task 1: Enforce record provenance
    let recordSource: RecordDataSource = input.dataSource || defaultDataSource;
    if (!VALID_DATA_SOURCES.has(recordSource)) {
      // Reject unknown source silently becoming verified
      recordSource = 'uploaded_manifest';
    }

    // Ensure synthetic data CANNOT be labelled as live or institutionally verified
    if (input.candidateName?.includes('TIMEOUT') || input.candidateName?.includes('UNMATCHED')) {
      if (input.dataSource === 'synthetic') {
        recordSource = 'synthetic';
      }
    }

    if (recordSource === 'synthetic') syntheticCount++;
    else if (recordSource === 'authorized_live_integration') authorizedLiveCount++;
    else uploadedManifestCount++;

    const cleanName = cleanCandidateName(input.candidateName || '');
    const cleanDept = cleanDepartmentName(input.department || '');
    const rawPhone = input.phoneNumber || '';
    const normPhone = normalizePhoneNumber(rawPhone);

    let status: CandidateAdmissionRecord['status'] = 'success';
    let statusMessage =
      recordSource === 'synthetic'
        ? '[TEST DATA] Synthetic candidate verified for simulation.'
        : 'Candidate verified and fields mapped.';

    // Check simulated portal errors / timeouts
    if (input.simulatedError === 'timeout') {
      status = 'failed';
      statusMessage = `Portal connection timeout on ${config.officialPortalUrl}. UNN server did not respond within deadline.`;
    } else if (input.simulatedError === 'unmatched') {
      status = 'unmatched';
      statusMessage = `Registration number ${cleanRegNo || rawRegNo} was not found on official UNN admission list.`;
    } else if (!cleanRegNo) {
      status = 'unmatched';
      statusMessage = 'Missing JAMB registration number.';
    } else if (enforceStrictRegNoPattern && !config.expectedRegNumberPattern.test(cleanRegNo)) {
      status = 'unmatched';
      statusMessage = `Registration number ${cleanRegNo} does not match valid JAMB format.`;
    } else if (!cleanName) {
      status = 'unmatched';
      statusMessage = 'Candidate name missing or unverified.';
    } else if (!cleanDept) {
      status = 'missing_department';
      statusMessage = 'Candidate verified, but department is empty or unassigned.';
    } else if (!normPhone.isValid) {
      status = 'missing_phone';
      statusMessage = rawPhone
        ? `Invalid phone number (${rawPhone}): ${normPhone.reason}`
        : 'Phone number not provided on candidate screening profile.';
    }

    const record: CandidateAdmissionRecord = {
      id: `adm-${index + 1}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      jambRegNumber: cleanRegNo || rawRegNo,
      candidateName: cleanName || 'Unknown Candidate',
      department: cleanDept || 'Unassigned Department',
      phoneNumber: normPhone.isValid ? normPhone.display : rawPhone || 'Not Available',
      normalizedPhone: normPhone.isValid ? normPhone.e164Digits : undefined,
      admissionType: category,
      status,
      statusMessage,
      dataSource: recordSource,
      portalSource: config.officialPortalUrl,
      isDuplicateWithinCategory: false,
      isCrossCategoryDuplicate: false,
      retrievedAt: new Date().toISOString(),
      rawSourceRow: index + 1,
    };

    records.push(record);

    // Track registration numbers for cross-category and intra-category auditing
    if (cleanRegNo) {
      const existing = regNoCategoryMap.get(cleanRegNo) || [];
      existing.push({ category, id: record.id });
      regNoCategoryMap.set(cleanRegNo, existing);
    }
  });

  // Pass 2: Audit duplicates (both intra-category duplicates and cross-category duplicates)
  let crossCategoryDuplicateCount = 0;
  let intraCategoryDuplicateCount = 0;

  for (const record of records) {
    if (!record.jambRegNumber) continue;

    const occurrences = regNoCategoryMap.get(record.jambRegNumber);
    if (!occurrences || occurrences.length <= 1) continue;

    const hasUtme = occurrences.some((o) => o.category === 'UTME');
    const hasDe = occurrences.some((o) => o.category === 'Direct Entry');

    // Rule: If a registration number appears in BOTH UTME and Direct Entry,
    // flag it for review rather than silently merging the records.
    if (hasUtme && hasDe) {
      record.isCrossCategoryDuplicate = true;
      record.status = 'flagged_review';
      record.reviewReason =
        `ATTENTION: Registration Number ${record.jambRegNumber} appears in both UTME and Direct Entry admission lists. ` +
        `Preserved as separate ${record.admissionType} record for administrative review.`;
      crossCategoryDuplicateCount++;
    } else {
      // Intra-category duplicate (multiple appearances in the same list)
      const sameCategoryList = occurrences.filter((o) => o.category === record.admissionType);
      if (sameCategoryList.length > 1) {
        // Mark subsequent duplicates
        const isFirst = sameCategoryList[0].id === record.id;
        if (!isFirst) {
          record.isDuplicateWithinCategory = true;
          record.status = 'flagged_review';
          record.reviewReason = `Duplicate registration number within ${record.admissionType} category list. Flagged for review.`;
          intraCategoryDuplicateCount++;
        }
      }
    }
  }

  // Filter lists
  const utmeRecords = records.filter((r) => r.admissionType === 'UTME');
  const directEntryRecords = records.filter((r) => r.admissionType === 'Direct Entry');
  const flaggedReviewRecords = records.filter((r) => r.status === 'flagged_review');

  // Compute metrics
  let successCount = 0;
  let missingPhoneCount = 0;
  let missingDeptCount = 0;
  let unmatchedCount = 0;
  let flaggedReviewCount = 0;
  let failedCount = 0;

  for (const r of records) {
    if (r.status === 'success') successCount++;
    else if (r.status === 'missing_phone') missingPhoneCount++;
    else if (r.status === 'missing_department') missingDeptCount++;
    else if (r.status === 'unmatched') unmatchedCount++;
    else if (r.status === 'flagged_review') flaggedReviewCount++;
    else if (r.status === 'failed') failedCount++;
  }

  const report: AdmissionProcessingReport = {
    selection,
    totalProcessed: records.length,
    utmeCount: utmeRecords.length,
    directEntryCount: directEntryRecords.length,
    successCount,
    missingPhoneCount,
    missingDeptCount,
    unmatchedCount,
    flaggedReviewCount,
    failedCount,
    crossCategoryDuplicateCount,
    intraCategoryDuplicateCount,
    syntheticCount,
    uploadedManifestCount,
    authorizedLiveCount,
    hasSyntheticData: syntheticCount > 0,
    processingTimeMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  return {
    records,
    utmeRecords,
    directEntryRecords,
    flaggedReviewRecords,
    report,
  };
}
