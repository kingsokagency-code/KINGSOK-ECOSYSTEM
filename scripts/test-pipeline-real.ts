import * as fs from 'fs';
import { processContactDataset } from '../src/lib/contacts/processor';

const text = fs.readFileSync('user_contacts.csv', 'utf8');
const result = processContactDataset(text, {
  nameColumn: 'First Name',
  phoneColumn: 'Phone 1 - Value',
});

console.log('Total Imported:', result.report.totalImported);
console.log('Valid:', result.report.validCount);
console.log('Invalid:', result.report.invalidCount);
console.log('Unique Valid:', result.report.uniqueValidCount);
console.log('Duplicates:', result.report.duplicateCount);
console.log('Batches (size 256):', result.report.totalBatches);
console.log('Processing time:', result.report.processingTimeMs, 'ms');
