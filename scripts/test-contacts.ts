/**
 * KINGSOK Contact Organizer & Messaging Assistant - Automated Verification Test Suite
 * Run via: npx tsx scripts/test-contacts.ts
 */

import { normalizePhoneNumber } from '../src/lib/contacts/normalizer';
import { deduplicateContacts } from '../src/lib/contacts/deduplication';
import { createBatches } from '../src/lib/contacts/batching';
import { processContactDataset, parseConsentStatus } from '../src/lib/contacts/processor';
import { personalizeMessage, extractFirstName } from '../src/lib/contacts/templates';
import { generateRealisticContactCsv } from '../src/lib/contacts/sampleData';
import { ContactRecord } from '../src/lib/contacts/types';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
  }
}

console.log('==============================================================================');
console.log('KINGSOK CONTACT ORGANIZER & MESSAGING ASSISTANT - TEST SUITE');
console.log('==============================================================================\n');

// ------------------------------------------------------------------------------
// TEST SUITE 1: NIGERIAN NUMBER NORMALIZATION & CARRIER IDENTIFICATION
// ------------------------------------------------------------------------------
console.log('1. Testing Nigerian Number Normalization & Carrier Identification:');

// Test standard 11-digit local
const t1 = normalizePhoneNumber('08031234567');
assert(t1.isValid && t1.normalized === '+2348031234567' && t1.network === 'MTN', 'Standard 11-digit MTN format (0803...)');

// Test Airtel
const t2 = normalizePhoneNumber('08021234567');
assert(t2.isValid && t2.normalized === '+2348021234567' && t2.network === 'Airtel', 'Airtel prefix identification (0802...)');

// Test Glo
const t3 = normalizePhoneNumber('08051234567');
assert(t3.isValid && t3.normalized === '+2348051234567' && t3.network === 'Glo', 'Glo prefix identification (0805...)');

// Test 9mobile
const t4 = normalizePhoneNumber('08091234567');
assert(t4.isValid && t4.normalized === '+2348091234567' && t4.network === '9mobile', '9mobile prefix identification (0809...)');

// Test with country code +234
const t5 = normalizePhoneNumber('+234 813 555 7890');
assert(t5.isValid && t5.normalized === '+2348135557890' && t5.network === 'MTN', 'Country code with spaces (+234 813...)');

// Test with 234 without +
const t6 = normalizePhoneNumber('2348161234567');
assert(t6.isValid && t6.normalized === '+2348161234567' && t6.network === 'MTN', '13-digit starting with 234 without plus');

// Test with SIM card format +234 (0) 803 123 4567
const t7 = normalizePhoneNumber('+234 (0) 803 123 4567');
assert(t7.isValid && t7.normalized === '+2348031234567', 'Android SIM card format (+234 (0) 803...)');

// Test missing leading zero (10 digits starting with 8)
const t8 = normalizePhoneNumber('8031234567');
assert(t8.isValid && t8.normalized === '+2348031234567', '10-digit missing leading zero (803...)');

// Test international E.164 number
const t9 = normalizePhoneNumber('+1 212 555 0199');
assert(t9.isValid && t9.normalized === '+12125550199' && t9.network === 'International', 'Valid US International number');

// Test non-numeric input
const t10 = normalizePhoneNumber('Call Mama');
assert(!t10.isValid && t10.reason.includes('non-numeric'), 'Rejects non-numeric alphabetic input');

// Test incomplete/short numbers
const t11 = normalizePhoneNumber('080312');
assert(!t11.isValid && t11.reason.includes('Incomplete'), 'Flags incomplete Nigerian number without guessing');

// Test invalid Nigerian mobile prefix
const t12 = normalizePhoneNumber('05012345678');
assert(!t12.isValid && t12.reason.includes('Ambiguous'), 'Flags unrecognized Nigerian prefix (050...)');

console.log('');

// ------------------------------------------------------------------------------
// TEST SUITE 2: DUPLICATE DETECTION ACROSS DIFFERENT FORMATS
// ------------------------------------------------------------------------------
console.log('2. Testing Duplicate Detection Across Varied Formats:');

const rawTestContacts: ContactRecord[] = [
  {
    id: 'c1',
    rawName: 'Emeka Okonkwo',
    displayName: 'Emeka Okonkwo',
    firstName: 'Emeka',
    lastName: 'Okonkwo',
    rawPhone: '08031234567',
    normalizedPhone: '+2348031234567',
    e164Digits: '2348031234567',
    displayPhone: '+234 803 123 4567',
    network: 'MTN',
    isValid: true,
    validationReason: 'Valid',
    isDuplicate: false,
    consentStatus: 'unknown',
    originalRowIndex: 1,
  },
  {
    id: 'c2',
    rawName: 'Chioma Eze',
    displayName: 'Chioma Eze',
    firstName: 'Chioma',
    lastName: 'Eze',
    rawPhone: '08029998877',
    normalizedPhone: '+2348029998877',
    e164Digits: '2348029998877',
    displayPhone: '+234 802 999 8877',
    network: 'Airtel',
    isValid: true,
    validationReason: 'Valid',
    isDuplicate: false,
    consentStatus: 'opted_in',
    originalRowIndex: 2,
  },
  {
    id: 'c3',
    rawName: 'Emeka O. UNN (Duplicate)',
    displayName: 'Emeka O. UNN',
    firstName: 'Emeka',
    lastName: 'O.',
    rawPhone: '+234 803 123 4567', // Same as c1, different format!
    normalizedPhone: '+2348031234567',
    e164Digits: '2348031234567',
    displayPhone: '+234 803 123 4567',
    network: 'MTN',
    isValid: true,
    validationReason: 'Valid',
    isDuplicate: false,
    consentStatus: 'unknown',
    originalRowIndex: 3,
  },
];

const dedup = deduplicateContacts(rawTestContacts);
assert(dedup.duplicateCount === 1, 'Correctly flags 1 duplicate out of 3 contacts');
assert(!dedup.processedContacts[0].isDuplicate, 'First contact c1 remains non-duplicate primary');
assert(dedup.processedContacts[2].isDuplicate && dedup.processedContacts[2].duplicateOfId === 'c1', 'Second contact c3 is flagged duplicate of c1');
assert(dedup.uniqueValidContacts.length === 2, 'Extracts exactly 2 unique valid contacts');

console.log('');

// ------------------------------------------------------------------------------
// TEST SUITE 3: AUTOMATIC BATCHING & BROADCAST SIZE LIMITS
// ------------------------------------------------------------------------------
console.log('3. Testing Automatic Batching (Default 256 WhatsApp Limit):');

// Generate 600 contacts to test multi-batch splitting
const manyContacts: ContactRecord[] = [];
for (let i = 1; i <= 600; i++) {
  manyContacts.push({
    id: `c-${i}`,
    rawName: `Student ${i}`,
    displayName: `Student ${i}`,
    firstName: 'Student',
    lastName: `${i}`,
    rawPhone: `0803${String(i).padStart(7, '0')}`,
    normalizedPhone: `+234803${String(i).padStart(7, '0')}`,
    e164Digits: `234803${String(i).padStart(7, '0')}`,
    displayPhone: `+234 803 ${i}`,
    network: 'MTN',
    isValid: true,
    validationReason: 'Valid',
    isDuplicate: false,
    consentStatus: i === 50 ? 'opted_out' : 'unknown', // 1 contact opted out
    originalRowIndex: i,
  });
}

const batchResult = createBatches(manyContacts, { batchSize: 256, excludeOptedOut: true });
assert(batchResult.batches.length === 3, `Splits 599 eligible contacts into 3 batches (found ${batchResult.batches.length})`);
assert(batchResult.batches[0].count === 256, 'Batch 1 contains exact maximum 256 contacts');
assert(batchResult.batches[1].count === 256, 'Batch 2 contains exact maximum 256 contacts');
assert(batchResult.batches[2].count === 87, `Batch 3 contains remaining 87 contacts (found ${batchResult.batches[2].count})`);
assert(batchResult.excludedOptedOutCount === 1, 'Excluded 1 opted-out contact from batches');

console.log('');

// ------------------------------------------------------------------------------
// TEST SUITE 4: CONSENT MANAGEMENT & STRICT EXCLUSION
// ------------------------------------------------------------------------------
console.log('4. Testing Consent Management:');

assert(parseConsentStatus('opted_in') === 'opted_in', 'Parses opted_in correctly');
assert(parseConsentStatus('STOP') === 'opted_out', 'Parses STOP as opted_out');
assert(parseConsentStatus('unsubscribed') === 'opted_out', 'Parses unsubscribed as opted_out');
assert(parseConsentStatus('') === 'unknown', 'Empty consent strictly defaults to unknown');
assert(parseConsentStatus(undefined) === 'unknown', 'Undefined consent strictly defaults to unknown');

console.log('');

// ------------------------------------------------------------------------------
// TEST SUITE 5: MESSAGE PERSONALIZATION & TEMPLATE ENGINE
// ------------------------------------------------------------------------------
console.log('5. Testing Message Personalization:');

assert(extractFirstName('Dr. Ngozi Okonkwo') === 'Ngozi', 'Extracts first name stripping title (Dr. Ngozi -> Ngozi)');
assert(extractFirstName('Pastor Ifeanyi Eze') === 'Ifeanyi', 'Extracts first name stripping Pastor');
assert(extractFirstName('Babatunde Adeleke') === 'Babatunde', 'Extracts first name (Babatunde Adeleke -> Babatunde)');
assert(extractFirstName('') === 'there', 'Fallback first name when blank is "there"');

const template = 'Good day {{first_name}}, welcome {{name}} to {{batch}}! Your registered phone is {{phone}}.';
const sampleContact: ContactRecord = {
  id: 'c-test',
  rawName: 'Engr. Chinedu Eze',
  displayName: 'Engr. Chinedu Eze',
  firstName: 'Chinedu',
  lastName: 'Eze',
  rawPhone: '08031234567',
  normalizedPhone: '+2348031234567',
  e164Digits: '2348031234567',
  displayPhone: '+234 803 123 4567',
  network: 'MTN',
  isValid: true,
  validationReason: 'Valid',
  isDuplicate: false,
  consentStatus: 'opted_in',
  batchName: 'Batch 01',
  batchNumber: 1,
  originalRowIndex: 1,
};

const personalized = personalizeMessage(template, sampleContact);
assert(personalized.includes('Good day Chinedu,'), 'Substituted {{first_name}} with Chinedu');
assert(personalized.includes('welcome Engr. Chinedu Eze'), 'Substituted {{name}} with full title & name');
assert(personalized.includes('to Batch 01!'), 'Substituted {{batch}}');
assert(personalized.includes('+234 803 123 4567'), 'Substituted {{phone}}');

console.log('');

// ------------------------------------------------------------------------------
// TEST SUITE 6: FULL DATASET PIPELINE VERIFICATION (5,000+ CONTACTS BENCHMARK)
// ------------------------------------------------------------------------------
console.log('6. Testing Full Pipeline with 5,000 Contacts Benchmark:');

const largeCsv = generateRealisticContactCsv(5000);
console.log(`  Generated realistic CSV with ~5,000 rows (${(largeCsv.length / 1024).toFixed(1)} KB)`);

const pipeStart = Date.now();
const pipeResult = processContactDataset(largeCsv, {
  nameColumn: 'Name',
  phoneColumn: 'Phone 1 - Value',
  consentColumn: 'Consent Status',
  notesColumn: 'Notes',
}, {
  batchSize: 256,
  excludeOptedOutFromBatches: true,
});
const duration = Date.now() - pipeStart;

console.log(`  Processed 5,000 contacts in ${duration}ms (${pipeResult.report.processingTimeMs}ms internal timer)`);
console.log(`  Report Metrics:`);
console.log(`    Total Imported:    ${pipeResult.report.totalImported}`);
console.log(`    Valid Numbers:     ${pipeResult.report.validCount}`);
console.log(`    Invalid Numbers:   ${pipeResult.report.invalidCount}`);
console.log(`    Duplicates Found:  ${pipeResult.report.duplicateCount}`);
console.log(`    Unique Valid:      ${pipeResult.report.uniqueValidCount}`);
console.log(`    Batches Created:   ${pipeResult.report.totalBatches}`);
console.log(`    Consent (Opted In):${pipeResult.report.optedInCount}`);
console.log(`    Consent (Unknown): ${pipeResult.report.unknownConsentCount}`);
console.log(`    Consent (Opted Out):${pipeResult.report.optedOutCount}`);

assert(pipeResult.report.totalImported === 5000, 'Total imported is exactly 5,000');
assert(pipeResult.report.validCount > 4500, 'Over 90% valid Nigerian numbers');
assert(pipeResult.report.invalidCount > 0, 'Flagged invalid/malformed records correctly');
assert(pipeResult.report.duplicateCount > 0, 'Detected duplicate numbers correctly');
assert(pipeResult.report.totalBatches > 15, `Created ${pipeResult.report.totalBatches} batches of max 256 contacts`);
assert(duration < 2500, `High performance: 5,000 records processed under 2.5s (${duration}ms)`);

console.log('\n==============================================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('==============================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
