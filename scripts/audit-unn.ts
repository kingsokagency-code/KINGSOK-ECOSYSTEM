import fs from 'fs';
import { parseCsvRaw } from '../src/lib/contacts/csvParser';
import { normalizePhoneNumber } from '../src/lib/contacts/normalizer';

const csv = fs.readFileSync('public/user_contacts.csv', 'utf-8');
const allRows = parseCsvRaw(csv);
const headers = allRows[0] || [];
const rows = allRows.slice(1);

const phoneColIdx = headers.findIndex(h => /phone 1 - value/i.test(h));
console.log('Phone 1 - Value column index:', phoneColIdx);

const unnKeywords = [
  // Cohorts & Tags
  /0'?2[789]/i, /0'?3[012]/i, /\bns\b/i, /new\s*students?/i, /fresher/i,
  /cust\b/i, /prop\b/i, /lodge\b/i, /tour\s*1?\.?0?/i, /valor/i, /\brep\b/i,
  /agen[cg]y/i, /\bunn\b/i, /unec\b/i, /campus\b/i, /student/i, /hall\b/i,
  // Departments
  /electrical/i, /electronic/i, /elect\b/i, /mech\b/i, /mechanical/i, /civil/i,
  /metullurgy/i, /metallurgy/i, /agric/i, /agriculture/i, /agronomy/i,
  /medsurg/i, /med\s*surg/i, /medicine/i, /\bmed\b/i, /surgery/i, /nursing/i,
  /\bnurs\b/i, /pharmacy/i, /\bpharm\b/i, /anatomy/i, /physiology/i, /dentistry/i,
  /medical\s*lab/i, /med\s*lab/i, /\bmls\b/i, /\bslt\b/i, /radiography/i,
  /law\b/i,
  /computer\s*sci/i, /comp\s*sci/i, /software/i, /cyber/i,
  /geology/i, /physics/i, /chemistry/i, /maths?/i, /zoology/i, /botany/i,
  /biochem/i, /microbio/i, /statistics/i,
  /economics/i, /\becon\b/i, /political/i, /pol\s*sci/i, /mass\s*comm/i,
  /public\s*admin/i, /pub\s*admin/i, /sociology/i, /psychology/i, /philosophy/i,
  /accountancy/i, /accounting/i, /\bacct\b/i, /banking/i, /finance/i,
  /marketing/i, /management/i,
  /theatre/i, /music/i, /linguistics/i, /igbo\b/i, /french\b/i, /english/i,
  /history/i, /architecture/i, /estate\b/i, /surveying/i, /urban/i,
  /education/i, /\bedu\b/i
];

let unnCount = 0;
let validPhones = 0;
const unnList: { rawName: string; cleanFirst: string; phone: string; tags: string[] }[] = [];

for (const row of rows) {
  const nameFields = [row[1], row[2], row[3], row[4], row[0]].filter(Boolean).join(' ');
  const rawPhone = row[phoneColIdx] || '';

  const matched: string[] = [];
  for (const k of unnKeywords) {
    if (k.test(nameFields)) {
      matched.push(k.source.replace(/\\b|\\s\*|\?|i/g, ''));
    }
  }

  if (matched.length > 0) {
    unnCount++;
    const norm = normalizePhoneNumber(rawPhone);
    if (norm.isValid) {
      validPhones++;
      unnList.push({
        rawName: nameFields,
        cleanFirst: '', // We'll test clean first name extraction
        phone: norm.e164Digits,
        tags: [...new Set(matched)],
      });
    }
  }
}

console.log('=== UNN TARGET AUDIENCE AUDIT ===');
console.log('Total contacts in file:', rows.length);
console.log('Total UNN / Campus contacts identified:', unnCount);
console.log('UNN contacts with VALID phone numbers:', validPhones);
console.log('Batches of 256 for UNN students:', Math.ceil(validPhones / 256));

console.log('\n--- 30 Sample Identified UNN Students ---');
unnList.slice(0, 30).forEach((u, i) => {
  console.log(`${i+1}. [${u.rawName}] -> Phone: +${u.phone} -> Tags: ${u.tags.slice(0, 3).join(', ')}`);
});
