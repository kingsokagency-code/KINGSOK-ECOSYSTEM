/**
 * KINGSOK Automatic Batching Engine
 * Divides clean, valid, non-opted-out contacts into manageable organizational batches (default: 256).
 */

import { BatchInfo, ContactRecord } from './types';

export interface BatchingOptions {
  batchSize?: number;
  excludeOptedOut?: boolean;
  prefix?: string; // Default 'Batch'
}

export interface BatchingResult {
  batches: BatchInfo[];
  totalBatchedContacts: number;
  excludedOptedOutCount: number;
  batchSize: number;
  summaryText: string;
}

export const WHATSAPP_BROADCAST_LIMIT_DEFAULT = 256;

export const WHATSAPP_BATCH_DISCLAIMER = `
IMPORTANT NOTICE REGARDING WHATSAPP BROADCAST LISTS:
1. These batches are organizational divisions created to assist your manual workflow.
2. They ARE NOT automatically injected into WhatsApp or created as live broadcast lists.
3. WhatsApp's Native Rule: Broadcast lists only deliver messages to recipients who have YOUR phone number saved in their personal address book.
4. Broadcast lists have a strict system limit of 256 recipients per list within the official WhatsApp application.
5. Never blast unsolicited bulk messages to unsaved contacts using unofficial automation scripts. Doing so violates WhatsApp Terms of Service and will trigger an account ban.
`.trim();

/**
 * Split eligible contacts into sequential batches
 */
export function createBatches(
  contacts: ContactRecord[],
  options: BatchingOptions = {}
): BatchingResult {
  const batchSize = Math.max(1, options.batchSize || WHATSAPP_BROADCAST_LIMIT_DEFAULT);
  const excludeOptedOut = options.excludeOptedOut ?? true;
  const prefix = options.prefix || 'Batch';

  let eligibleContacts: ContactRecord[] = [];
  let excludedOptedOutCount = 0;

  for (const c of contacts) {
    // Only valid and non-duplicate contacts can be placed into batches
    if (!c.isValid || c.isDuplicate) {
      continue;
    }

    // Check opt-out policy
    if (excludeOptedOut && c.consentStatus === 'opted_out') {
      excludedOptedOutCount++;
      continue;
    }

    eligibleContacts.push(c);
  }

  const batches: BatchInfo[] = [];
  const totalCount = eligibleContacts.length;
  let batchIndex = 1;

  for (let i = 0; i < totalCount; i += batchSize) {
    const chunk = eligibleContacts.slice(i, i + batchSize);
    const batchName = `${prefix} ${String(batchIndex).padStart(2, '0')} (${i + 1}-${Math.min(i + batchSize, totalCount)})`;
    
    // Tag each contact with their batch number
    const taggedContacts = chunk.map((contact) => ({
      ...contact,
      batchNumber: batchIndex,
      batchName,
    }));

    batches.push({
      batchNumber: batchIndex,
      batchName,
      count: taggedContacts.length,
      startIndex: i + 1,
      endIndex: Math.min(i + batchSize, totalCount),
      contacts: taggedContacts,
    });

    batchIndex++;
  }

  return {
    batches,
    totalBatchedContacts: totalCount,
    excludedOptedOutCount,
    batchSize,
    summaryText: `${totalCount} contacts divided into ${batches.length} batch${batches.length === 1 ? '' : 'es'} of max ${batchSize} contacts each.`,
  };
}
