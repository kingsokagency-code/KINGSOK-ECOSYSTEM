/**
 * KINGSOK Contact Deduplication Engine
 * Identifies duplicate contacts by normalized international phone number.
 */

import { ContactRecord } from './types';

export interface DeduplicationResult {
  processedContacts: ContactRecord[];
  uniqueValidContacts: ContactRecord[];
  duplicatesList: ContactRecord[];
  duplicateCount: number;
}

/**
 * Deduplicate a list of contact records.
 * The first valid occurrence is treated as primary; subsequent matches are flagged as duplicates.
 */
export function deduplicateContacts(contacts: ContactRecord[]): DeduplicationResult {
  const seenPhoneMap = new Map<string, string>(); // normalizedPhone -> primary contact id
  const processedContacts: ContactRecord[] = [];
  const duplicatesList: ContactRecord[] = [];
  const uniqueValidContacts: ContactRecord[] = [];

  for (const contact of contacts) {
    // If the phone number is invalid, we do not group it with others by phone,
    // but we still include it in the overall list
    if (!contact.isValid || !contact.normalizedPhone) {
      processedContacts.push({
        ...contact,
        isDuplicate: false,
      });
      continue;
    }

    const key = contact.normalizedPhone;
    if (seenPhoneMap.has(key)) {
      const primaryId = seenPhoneMap.get(key)!;
      const dupContact: ContactRecord = {
        ...contact,
        isDuplicate: true,
        duplicateOfId: primaryId,
      };
      processedContacts.push(dupContact);
      duplicatesList.push(dupContact);
    } else {
      seenPhoneMap.set(key, contact.id);
      const uniqueContact: ContactRecord = {
        ...contact,
        isDuplicate: false,
      };
      processedContacts.push(uniqueContact);
      uniqueValidContacts.push(uniqueContact);
    }
  }

  return {
    processedContacts,
    uniqueValidContacts,
    duplicatesList,
    duplicateCount: duplicatesList.length,
  };
}
