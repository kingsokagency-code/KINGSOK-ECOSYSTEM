import * as fs from 'fs';
import { parseCsvRaw } from '../src/lib/contacts/csvParser';
import { normalizePhoneNumber } from '../src/lib/contacts/normalizer';
import { deduplicateContacts } from '../src/lib/contacts/deduplication';
import { createBatches } from '../src/lib/contacts/batching';
import { ContactRecord } from '../src/lib/contacts/types';

const csvText = fs.readFileSync('user_contacts.csv', 'utf8');
const rows = parseCsvRaw(csvText);
const headers = rows[0];

const phone1Idx = headers.indexOf('Phone 1 - Value');
const phone2Idx = headers.indexOf('Phone 2 - Value');
const firstNameIdx = headers.indexOf('First Name');
const middleNameIdx = headers.indexOf('Middle Name');
const lastNameIdx = headers.indexOf('Last Name');
const fileAsIdx = headers.indexOf('File As');
const orgNameIdx = headers.indexOf('Organization Name');
const nicknameIdx = headers.indexOf('Nickname');

const contacts: ContactRecord[] = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const p1 = row[phone1Idx]?.trim() || '';
  const p2 = phone2Idx !== -1 ? row[phone2Idx]?.trim() || '' : '';
  const phone = p1 || p2;

  const firstName = row[firstNameIdx]?.trim() || '';
  const middleName = row[middleNameIdx]?.trim() || '';
  const lastName = row[lastNameIdx]?.trim() || '';
  const fileAs = row[fileAsIdx]?.trim() || '';
  const orgName = row[orgNameIdx]?.trim() || '';
  const nickname = row[nicknameIdx]?.trim() || '';

  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  let cleanName = nameParts.length > 0 ? nameParts.join(' ') : fileAs || orgName || nickname || '';

  const norm = normalizePhoneNumber(phone);

  if (!cleanName) {
    cleanName = norm.localDisplay ? `Contact (${norm.localDisplay})` : `Contact ${i}`;
  }

  // If cleanName is just punctuation like "," or "."
  if (/^[.,_\-~*#]+$/.test(cleanName)) {
    cleanName = norm.localDisplay ? `Contact (${norm.localDisplay})` : `Contact ${i}`;
  }

  contacts.push({
    id: `cnt-${i}`,
    rawName: cleanName,
    displayName: cleanName,
    firstName: firstName || cleanName.split(' ')[0],
    lastName: lastName || '',
    rawPhone: phone,
    normalizedPhone: norm.normalized,
    e164Digits: norm.e164Digits,
    displayPhone: norm.display,
    network: norm.network,
    isValid: norm.isValid,
    validationReason: norm.reason,
    isDuplicate: false,
    consentStatus: 'unknown',
    originalRowIndex: i,
  });
}

const dedup = deduplicateContacts(contacts);
const batching = createBatches(dedup.uniqueValidContacts, { batchSize: 256, excludeOptedOut: true });

console.log('=== REAL DATASET VERIFICATION SUMMARY ===');
console.log('Total Raw Contacts in File:', contacts.length);
console.log('Total Valid Phone Numbers:', contacts.filter(c => c.isValid).length);
console.log('Total Duplicates Detected (Same Person / Number):', dedup.duplicateCount);
console.log('Total UNIQUE Valid Contacts (Clean):', dedup.uniqueValidContacts.length);
console.log('Total Invalid Numbers:', contacts.filter(c => !c.isValid && c.rawPhone).length);
console.log('Total Empty Numbers:', contacts.filter(c => !c.rawPhone).length);
console.log('Total Number of 256 Batches Created:', batching.batches.length);
console.log('\nBatches Details:');
batching.batches.forEach(b => {
  console.log(`  - ${b.batchName}: ${b.count} contacts`);
});
