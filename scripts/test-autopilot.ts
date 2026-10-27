import { buildAutoPilotPayload, generateWhatsAppWebAutoPilotScript } from '../src/lib/contacts/autoPilot';
import { ContactRecord, MessageTemplate } from '../src/lib/contacts/types';

const mockContacts: ContactRecord[] = [
  {
    id: 'c1',
    rawName: 'Emeka Okafor',
    displayName: 'Emeka Okafor',
    firstName: 'Emeka',
    lastName: 'Okafor',
    rawPhone: '08031234567',
    normalizedPhone: '+2348031234567',
    displayPhone: '0803 123 4567',
    e164Digits: '2348031234567',
    network: 'MTN',
    isValid: true,
    isDuplicate: false,
    consentStatus: 'unknown',
    batchNumber: 1,
    batchName: 'Batch 1',
    validationReason: 'Valid Nigerian number',
    originalRowIndex: 1,
  },
  {
    id: 'c2',
    rawName: 'Ngozi Adebayo',
    displayName: 'Ngozi Adebayo',
    firstName: 'Ngozi',
    lastName: 'Adebayo',
    rawPhone: '08029876543',
    normalizedPhone: '+2348029876543',
    displayPhone: '0802 987 6543',
    e164Digits: '2348029876543',
    network: 'Airtel',
    isValid: true,
    isDuplicate: false,
    consentStatus: 'opted_in',
    batchNumber: 1,
    batchName: 'Batch 1',
    validationReason: 'Valid Nigerian number',
    originalRowIndex: 2,
  },
  {
    id: 'c3',
    rawName: 'Opted Out Contact',
    displayName: 'Opted Out Contact',
    firstName: 'Opted',
    lastName: 'Out',
    rawPhone: '08051112233',
    normalizedPhone: '+2348051112233',
    displayPhone: '0805 111 2233',
    e164Digits: '2348051112233',
    network: 'Glo',
    isValid: true,
    isDuplicate: false,
    consentStatus: 'opted_out', // Should be excluded!
    batchNumber: 1,
    batchName: 'Batch 1',
    validationReason: 'Valid Nigerian number',
    originalRowIndex: 3,
  },
];

const mockTemplate: MessageTemplate = {
  id: 'tmpl-1',
  title: 'KINGSOK Accommodations',
  category: 'accommodation',
  description: 'Accommodation update',
  content: 'Hello {{first_name}}, this is KingSok Accommodations. New lodges in UNN are now available.',
  createdAt: new Date().toISOString(),
  isSystem: true,
};

const payload = buildAutoPilotPayload(mockContacts, 1, mockTemplate, 6);

console.log('--- AutoPilot Payload Verification ---');
console.log('Batch Name:', payload.batchName);
console.log('Total contacts:', payload.totalContacts);
console.log('Contact 1 Message:', payload.contacts[0].message);
console.log('Contact 2 Message:', payload.contacts[1].message);

if (payload.totalContacts !== 2) {
  throw new Error(`Expected 2 contacts (excluding opted out), got ${payload.totalContacts}`);
}

if (!payload.contacts[0].message.includes('Hello Emeka')) {
  throw new Error('Personalization failed for contact 1');
}

if (!payload.contacts[1].message.includes('Hello Ngozi')) {
  throw new Error('Personalization failed for contact 2');
}

const script = generateWhatsAppWebAutoPilotScript(payload);
if (!script.includes('kingsok-hud') || !script.includes('START BATCH')) {
  throw new Error('Generated script is malformed');
}

console.log('AutoPilot script generated successfully, length:', script.length);
console.log('ALL AUTOPILOT CHECKS PASSED!');
