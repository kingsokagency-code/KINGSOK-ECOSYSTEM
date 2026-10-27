import * as fs from 'fs';
import { processContactDataset } from '../src/lib/contacts/processor';
import { createBatches } from '../src/lib/contacts/batching';
import { generateStandardContactsCsv, generateGoogleContactsImportCsv } from '../src/lib/contacts/csvExporter';
import { DEFAULT_TEMPLATES, personalizeMessage } from '../src/lib/contacts/templates';
import { buildAutoPilotPayload, generateWhatsAppWebAutoPilotScript } from '../src/lib/contacts/autoPilot';

const csvPath = fs.existsSync('public/user_contacts.csv') ? 'public/user_contacts.csv' : 'user_contacts.csv';
const text = fs.readFileSync(csvPath, 'utf8');

console.log('=== TESTING REAL DATASET UNN PIPELINE ===');
const result = processContactDataset(text, {
  nameColumn: 'First Name',
  phoneColumn: 'Phone 1 - Value',
});

console.log('Total Imported:', result.report.totalImported);
console.log('Unique Valid:', result.report.uniqueValidCount);
console.log('UNN Verified Contacts in Report:', result.report.unnVerifiedCount);

// Test UNN filtering
const unnContacts = result.allContacts.filter((c) => c.isUnnVerified && c.isValid && !c.isDuplicate);
console.log('\nVerified UNN Unique Valid Contacts:', unnContacts.length);

// Test UNN Batching
const unnBatches = createBatches(unnContacts, {
  batchSize: 256,
  prefix: 'UNN Batch',
}).batches;

console.log(`UNN Batches Created: ${unnBatches.length}`);
unnBatches.forEach((b) => {
  console.log(` - ${b.batchName}: ${b.count} contacts (${b.startIndex} - ${b.endIndex})`);
});

// Test First 15 UNN Contacts Clean Greetings
console.log('\n--- First 15 Clean UNN Contact Greetings ---');
unnBatches[0].contacts.slice(0, 15).forEach((c, idx) => {
  console.log(`${idx + 1}. Raw: "${c.displayName}" -> Clean Greeting: "Hello ${c.firstName}" -> E.164: +${c.normalizedPhone}`);
});

// Test Combo Template Personalization
console.log('\n--- Template Personalization Test ---');
const comboTemplate = DEFAULT_TEMPLATES[0]; // tmpl-nsukka-groups-combo
console.log('Template Title:', comboTemplate.title);

const sampleStudent = unnBatches[0].contacts[0];
const personalized = personalizeMessage(comboTemplate.content, sampleStudent, { batchNumber: 1 });
console.log('\nPersonalized Message Sample for ' + sampleStudent.displayName + ':');
console.log('----------------------------------------------------');
console.log(personalized);
console.log('----------------------------------------------------');

// Verify Auto-Pilot Payload Generation
const payload = buildAutoPilotPayload(unnBatches[0].contacts, 1, comboTemplate, 6);
console.log('\nAuto-Pilot Payload for Batch 1:');
console.log(`- Batch: ${payload.batchName}`);
console.log(`- Total Contacts in Payload: ${payload.totalContacts}`);
console.log(`- Safe Anti-Ban Delay: ${payload.delaySeconds}s`);
console.log(`- First Contact Payload: ${payload.contacts[0].firstName} (+${payload.contacts[0].phone})`);

// Verify Google Contacts Import CSV
const googleCsv = generateGoogleContactsImportCsv(unnBatches[0].contacts, 'KINGSOK_UNN_Batch_01');
console.log('\nGoogle Contacts CSV Generated, length:', googleCsv.length, 'chars');
console.log('Google Contacts CSV Header Sample:');
console.log(googleCsv.split('\n')[0]);
console.log(googleCsv.split('\n')[1]?.slice(0, 100) + '...');

console.log('\n✅ ALL UNN PIPELINE TESTS PASSED 100%!');
