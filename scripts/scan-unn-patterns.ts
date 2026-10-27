import fs from 'fs';
import { parseCsvRaw } from '../src/lib/contacts/csvParser';

const csv = fs.readFileSync('public/user_contacts.csv', 'utf-8');
const allRows = parseCsvRaw(csv);
const headers = allRows[0] || [];
const rows = allRows.slice(1);

const nameIdx = headers.findIndex(h => /first.*name/i.test(h) || /^name$/i.test(h));
const phoneIdx = headers.findIndex(h => /phone.*value/i.test(h) || /phone/i.test(h));

console.log('Total Rows in CSV:', rows.length);
console.log('Name column index:', nameIdx);
console.log('Phone column index:', phoneIdx);

// Keywords provided by user:
// NS, department, Electrical, Electronic, MedSurg, Chisom MedSurg, Fresher, New Students, CuSt, PROP, lodge, 029, tour 1.0, valor, rep, agency/agengy
const patterns = [
  /\bns\b/i,
  /new\s*students?/i,
  /fresher/i,
  /cust\b/i,
  /prop\b/i,
  /lodge\b/i,
  /029\b/,
  /tour\s*1\.?0?/i,
  /valor\b/i,
  /\brep\b/i,
  /agen[cg]y\b/i,
  /\bunn\b/i,
  // Departments
  /electrical/i,
  /electronic/i,
  /elect\b/i,
  /medsurg/i,
  /med\s*surg/i,
  /medicine/i,
  /\bmed\b/i,
  /surgery/i,
  /nursing/i,
  /\bnurs\b/i,
  /pharmacy/i,
  /\bpharm\b/i,
  /\blaw\b/i,
  /computer\s*sci/i,
  /comp\s*sci/i,
  /mechanical/i,
  /\bmech\b/i,
  /civil/i,
  /biochem/i,
  /microbio/i,
  /economics/i,
  /\becon\b/i,
  /political/i,
  /pol\s*sci/i,
  /mass\s*comm/i,
  /accountancy/i,
  /accounting/i,
  /\bacct\b/i,
  /agriculture/i,
  /\bagric\b/i,
  /anatomy/i,
  /physiology/i,
  /dentistry/i,
  /medical\s*lab/i,
  /med\s*lab/i,
  /mls\b/i,
  /geology/i,
  /physics/i,
  /chemistry/i,
  /maths?/i,
  /zoology/i,
  /botany/i,
  /statistics/i,
  /banking/i,
  /finance/i,
  /marketing/i,
  /management/i,
  /sociology/i,
  /psychology/i,
  /philosophy/i,
  /history/i,
  /theatre/i,
  /music/i,
  /linguistics/i,
  /igbo\b/i,
  /french\b/i,
  /english/i,
  /arch\b/i,
  /architecture/i,
  /estate\b/i,
  /surveying/i,
  /urban\b/i
];

const matches: { name: string; phone: string; matchedKeywords: string[] }[] = [];

for (const row of rows) {
  // Check First Name, Middle Name, Last Name, Organization Name, etc.
  const nameFields = [row[1], row[2], row[3], row[4], row[0]].filter(Boolean).join(' ');
  const phone = row[phoneIdx] || '';

  const matchedKeywords: string[] = [];
  for (const p of patterns) {
    if (p.test(nameFields)) {
      matchedKeywords.push(p.source.replace(/\\b|\\s\*|\?|i/g, ''));
    }
  }

  if (matchedKeywords.length > 0) {
    matches.push({ name: nameFields.trim(), phone, matchedKeywords: [...new Set(matchedKeywords)] });
  }
}

console.log('Total UNN / Campus Targeted Contacts Found:', matches.length);
console.log('\n--- 40 Sample Targeted Matches ---');
matches.slice(0, 40).forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.name}] | Phone: ${m.phone} | Tags: ${m.matchedKeywords.join(', ')}`);
});
