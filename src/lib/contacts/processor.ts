/**
 * KINGSOK Contact Processing & Cleaning Pipeline Orchestrator
 * Connects parsing, normalization, deduplication, batching, and consent evaluation.
 */

import {
  CleaningReport,
  ColumnMapping,
  ConsentStatus,
  ContactRecord,
} from './types';
import { normalizePhoneNumber } from './normalizer';
import { deduplicateContacts } from './deduplication';
import { createBatches, WHATSAPP_BROADCAST_LIMIT_DEFAULT } from './batching';
import { parseCsvWithMapping } from './csvParser';
import { extractFirstName } from './templates';
import { detectUnnContact } from './unnFilter';

export interface ProcessContactsOptions {
  batchSize?: number;
  excludeOptedOutFromBatches?: boolean;
}

export interface ProcessedPipelineResult {
  allContacts: ContactRecord[];
  uniqueValidContacts: ContactRecord[];
  duplicatesList: ContactRecord[];
  invalidContacts: ContactRecord[];
  batches: ReturnType<typeof createBatches>['batches'];
  report: CleaningReport;
}

/**
 * Determine consent status from raw text input.
 * Default is STRICTLY 'unknown' — never assumes a phone number indicates consent.
 */
export function parseConsentStatus(rawConsent?: string): ConsentStatus {
  if (!rawConsent) return 'unknown';

  const lower = rawConsent.trim().toLowerCase();
  if (['opted_in', 'opted in', 'opt in', 'yes', 'true', '1', 'agreed', 'subscribed', 'consented'].includes(lower)) {
    return 'opted_in';
  }
  if (['opted_out', 'opted out', 'opt out', 'no', 'false', '0', 'stop', 'unsubscribed', 'revoked'].includes(lower)) {
    return 'opted_out';
  }

  return 'unknown';
}

/**
 * Clean name and extract first / last name with UNN student detection
 */
function processNames(rawName: string, fallbackPhone: string): {
  displayName: string;
  firstName: string;
  lastName: string;
  isUnnVerified: boolean;
  unnTags: string[];
} {
  let cleanName = (rawName ?? '').trim();

  if (!cleanName) {
    cleanName = fallbackPhone ? `Contact (${fallbackPhone})` : 'Unnamed Contact';
  }

  const { isUnn, tags, cleanFirstName } = detectUnnContact(cleanName);
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const firstName = cleanFirstName || extractFirstName(cleanName);
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  return {
    displayName: cleanName,
    firstName,
    lastName,
    isUnnVerified: isUnn,
    unnTags: tags,
  };
}

/**
 * Run the entire contact processing pipeline
 */
export function processContactDataset(
  csvText: string,
  mapping: ColumnMapping,
  options: ProcessContactsOptions = {}
): ProcessedPipelineResult {
  const startTime = Date.now();
  const rawRows = parseCsvWithMapping(csvText, mapping);

  // Step 1: Normalize all records
  const initialContacts: ContactRecord[] = rawRows.map((row, idx) => {
    const norm = normalizePhoneNumber(row.rawPhone);
    const { displayName, firstName, lastName, isUnnVerified, unnTags } = processNames(row.rawName, norm.localDisplay || row.rawPhone);
    const consent = parseConsentStatus(row.rawConsent);

    return {
      id: `cnt-${idx + 1}-${Date.now().toString(36)}`,
      rawName: row.rawName,
      displayName,
      firstName,
      lastName,
      rawPhone: row.rawPhone,
      normalizedPhone: norm.normalized,
      e164Digits: norm.e164Digits,
      displayPhone: norm.display,
      network: norm.network,
      isValid: norm.isValid,
      validationReason: norm.reason,
      isDuplicate: false,
      consentStatus: consent,
      isUnnVerified,
      unnTags,
      notes: row.rawNotes,
      originalRowIndex: row.rowIndex,
    };
  });

  // Step 2: Deduplication
  const dedupResult = deduplicateContacts(initialContacts);

  // Step 3: Batching
  const batchSize = options.batchSize || WHATSAPP_BROADCAST_LIMIT_DEFAULT;
  const batchingResult = createBatches(dedupResult.processedContacts, {
    batchSize,
    excludeOptedOut: options.excludeOptedOutFromBatches ?? true,
  });

  // Map batches back onto the contact list so every contact knows their batch
  const contactBatchMap = new Map<string, { batchNumber: number; batchName: string }>();
  for (const b of batchingResult.batches) {
    for (const c of b.contacts) {
      contactBatchMap.set(c.id, {
        batchNumber: b.batchNumber,
        batchName: b.batchName,
      });
    }
  }

  const finalizedContacts = dedupResult.processedContacts.map((c) => {
    const assigned = contactBatchMap.get(c.id);
    if (assigned) {
      return {
        ...c,
        batchNumber: assigned.batchNumber,
        batchName: assigned.batchName,
      };
    }
    return c;
  });

  // Compute metrics
  let validCount = 0;
  let invalidCount = 0;
  let optedInCount = 0;
  let unknownConsentCount = 0;
  let optedOutCount = 0;

  const invalidContacts: ContactRecord[] = [];

  for (const c of finalizedContacts) {
    if (c.isValid) {
      validCount++;
    } else {
      invalidCount++;
      invalidContacts.push(c);
    }

    if (c.consentStatus === 'opted_in') optedInCount++;
    else if (c.consentStatus === 'opted_out') optedOutCount++;
    else unknownConsentCount++;
  }

  const unnVerifiedCount = finalizedContacts.filter((c) => c.isValid && !c.isDuplicate && c.isUnnVerified).length;

  const report: CleaningReport = {
    totalImported: finalizedContacts.length,
    validCount,
    invalidCount,
    duplicateCount: dedupResult.duplicateCount,
    uniqueValidCount: dedupResult.uniqueValidContacts.length,
    optedInCount,
    unknownConsentCount,
    optedOutCount,
    unnVerifiedCount,
    totalBatches: batchingResult.batches.length,
    batchSize,
    processingTimeMs: Date.now() - startTime,
  };

  return {
    allContacts: finalizedContacts,
    uniqueValidContacts: dedupResult.uniqueValidContacts,
    duplicatesList: dedupResult.duplicatesList,
    invalidContacts,
    batches: batchingResult.batches,
    report,
  };
}
