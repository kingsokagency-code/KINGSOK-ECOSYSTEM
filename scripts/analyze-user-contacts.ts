import * as fs from 'fs';
import { parseCsvRaw } from '../src/lib/contacts/csvParser';
import { normalizePhoneNumber } from '../src/lib/contacts/normalizer';

const csvText = fs.readFileSync('user_contacts.csv', 'utf8');
const rows = parseCsvRaw(csvText);

console.log('Total parsed rows (including header):', rows.length);
const headers = rows[0];
console.log('Headers count:', headers.length);
console.log('Headers:', headers);

const phone1Idx = headers.indexOf('Phone 1 - Value');
const phone2Idx = headers.indexOf('Phone 2 - Value');
const firstNameIdx = headers.indexOf('First Name');
const middleNameIdx = headers.indexOf('Middle Name');
const lastNameIdx = headers.indexOf('Last Name');
const fileAsIdx = headers.indexOf('File As');
const orgNameIdx = headers.indexOf('Organization Name');
const nicknameIdx = headers.indexOf('Nickname');

console.log({
  phone1Idx,
  phone2Idx,
  firstNameIdx,
  middleNameIdx,
  lastNameIdx,
  fileAsIdx,
  orgNameIdx,
  nicknameIdx,
});

let validCount = 0;
let invalidCount = 0;
let emptyPhoneCount = 0;
let scientificCount = 0;
let hasPhone2Count = 0;

const invalidReasons = new Map<string, number>();
const sampleInvalid: any[] = [];
const sampleValid: any[] = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const p1 = row[phone1Idx]?.trim() || '';
  const p2 = phone2Idx !== -1 ? row[phone2Idx]?.trim() || '' : '';
  const phone = p1 || p2;

  if (p2) hasPhone2Count++;

  const firstName = row[firstNameIdx]?.trim() || '';
  const middleName = row[middleNameIdx]?.trim() || '';
  const lastName = row[lastNameIdx]?.trim() || '';
  const fileAs = row[fileAsIdx]?.trim() || '';
  const orgName = row[orgNameIdx]?.trim() || '';
  const nickname = row[nicknameIdx]?.trim() || '';

  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  const fullName = nameParts.length > 0 ? nameParts.join(' ') : fileAs || orgName || nickname || '';

  if (!phone) {
    emptyPhoneCount++;
    continue;
  }

  if (/e\+/i.test(phone)) {
    scientificCount++;
  }

  const norm = normalizePhoneNumber(phone);
  if (norm.isValid) {
    validCount++;
    if (sampleValid.length < 10) {
      sampleValid.push({
        rawName: fullName,
        rawPhone: phone,
        normalized: norm.normalized,
        carrier: norm.network,
      });
    }
  } else {
    invalidCount++;
    invalidReasons.set(norm.reason, (invalidReasons.get(norm.reason) || 0) + 1);
    if (sampleInvalid.length < 15) {
      sampleInvalid.push({
        row: i + 1,
        fullName,
        rawPhone: phone,
        reason: norm.reason,
      });
    }
  }
}

console.log('--- ANALYSIS RESULTS ---');
console.log('Total Contact Records:', rows.length - 1);
console.log('Valid Numbers:', validCount);
console.log('Invalid Numbers:', invalidCount);
console.log('Empty Phone Records:', emptyPhoneCount);
console.log('Records with Phone 2:', hasPhone2Count);
console.log('Scientific notation phone numbers:', scientificCount);
console.log('\nTop Invalid Reasons:');
for (const [reason, count] of invalidReasons.entries()) {
  console.log(`  - ${reason}: ${count}`);
}

console.log('\nSample Valid Records:');
console.dir(sampleValid, { depth: null });

console.log('\nSample Invalid Records:');
console.dir(sampleInvalid, { depth: null });
