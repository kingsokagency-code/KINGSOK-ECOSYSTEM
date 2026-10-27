/**
 * KINGSOK Message Management & Personalization Engine
 * Built for compliant WhatsApp communication, template management, and live previews.
 */

import { ContactRecord, MessageTemplate } from './types';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-accommodation-unn',
    title: 'KINGSOK ACCOMMODATIONS: UNN Lodge Finder & Student Housing',
    category: 'accommodation',
    description: 'Off-campus student housing updates for UNN Nsukka (Ofulonu, Hilltop, Odim, Behind Flat, Green House) & UNEC.',
    content: `Good day {{first_name}}, this is KINGSOK ACCOMMODATIONS UNN.

Are you looking for a secure, verified student lodge or apartment around campus for this upcoming academic session?

We currently have verified vacancies in:
• Hilltop & Ofulonu (Self-contain & Single rooms)
• Odim Gate & Behind Flat (Quiet study environments)
• Green House & Total Axis (Standard flats & shared apartments)

Every lodge is physically inspected by the KINGSOK team with verified caretakers, zero fraud risk, and clear tenancy terms.

👉 Reply LODGE to view current available vacancies and schedule a free inspection, or chat directly with our student housing desk.

(Note: Reply STOP at any time to opt out of accommodation notifications)`,
    createdAt: '2026-10-27T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: 'tmpl-admission-unn',
    title: 'KINGSOK ENTERPRISES: UNN Admission & Clearance Alerts',
    category: 'admission',
    description: 'Official UNN screening, primary/supplementary list alerts, and biometric clearance guidance.',
    content: `Hello {{first_name}}, official update from KINGSOK ENTERPRISES UNN.

If you or your candidate participated in the 2026 UNN Post-UTME screening, please be informed that the university has begun releasing departmental cut-offs and clearance instructions.

Important reminders:
1. Ensure your O-Level results are correctly uploaded on JAMB CAPS.
2. Beware of unauthorized agents asking for "admission racketeering" fees.
3. Prepare all verification credentials before physical departmental screening begins.

👉 Reply ADMISSION to receive our step-by-step UNN Clearance Checklist, or visit our office near UNN campus for guided document processing.

(Reply STOP to unsubscribe from UNN admission updates)`,
    createdAt: '2026-10-27T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: 'tmpl-contact-save-consent',
    title: 'KINGSOK Ecosystem: Contact Save & Subscription Confirmation',
    category: 'consent',
    description: 'Requests contact to save your official WhatsApp number so future broadcasts are successfully delivered.',
    content: `Dear {{first_name}}, greetings from KINGSOK ECOSYSTEM.

We want to make sure you never miss critical campus housing updates, academic notices, and student welfare services.

⚠️ Important WhatsApp Requirement:
WhatsApp only delivers broadcast updates to recipients who have our official number saved in their phone contacts.

Please take 5 seconds to:
1. Save this number as "KINGSOK Official" in your phone contacts.
2. Reply "SAVED" so we can register your active subscription.

If you received this message by error or do not wish to receive updates from KINGSOK, reply STOP to immediately remove your number.`,
    createdAt: '2026-10-27T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: 'tmpl-general-inquiry',
    title: 'KINGSOK General Service Desk & Support',
    category: 'general',
    description: 'General inquiry follow-up and student welfare support.',
    content: `Hello {{first_name}}, thank you for connecting with the KINGSOK Ecosystem.

Our desks for UNN Accommodation Scouting, Academic Documentation, and Student Logistics are active to assist you. 

How can we assist you today? Feel free to reply directly to this message.

(Reply STOP if you wish to opt out of further notifications)`,
    createdAt: '2026-10-27T00:00:00.000Z',
    isSystem: true,
  },
];

/**
 * Extract an elegant first name from contact name.
 * Handles titles like "Bro", "Sis", "Engr", "Dr", "Pastor", "Mr", "Mrs", "Chief".
 */
export function extractFirstName(fullName: string): string {
  const clean = fullName.trim();
  if (!clean || clean.toLowerCase().startsWith('contact') || clean.toLowerCase().startsWith('unknown')) {
    return 'there';
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'there';

  const titles = new Set(['mr', 'mrs', 'miss', 'ms', 'dr', 'prof', 'engr', 'barr', 'pst', 'pastor', 'bro', 'sis', 'chief', 'hon']);
  let firstValid = parts[0];

  if (titles.has(firstValid.toLowerCase().replace('.', '')) && parts.length > 1) {
    firstValid = parts[1];
  }

  // Capitalize properly
  return firstValid.charAt(0).toUpperCase() + firstValid.slice(1).toLowerCase();
}

/**
 * Replace placeholders in a message template with contact details
 */
export function personalizeMessage(
  templateContent: string,
  contact?: ContactRecord | null,
  options?: { fallbackName?: string }
): string {
  const fallback = options?.fallbackName || 'there';

  if (!contact) {
    return templateContent
      .replace(/{{name}}/gi, fallback)
      .replace(/{{first_name}}/gi, fallback)
      .replace(/{{phone}}/gi, '+234 800 000 0000')
      .replace(/{{batch}}/gi, 'Batch 01');
  }

  const firstName = contact.firstName || extractFirstName(contact.displayName);
  const fullName = contact.displayName || contact.rawName || fallback;
  const phone = contact.displayPhone || contact.normalizedPhone || contact.rawPhone;
  const batch = contact.batchName || (contact.batchNumber ? `Batch ${contact.batchNumber}` : 'Batch 01');

  return templateContent
    .replace(/{{name}}/gi, fullName)
    .replace(/{{first_name}}/gi, firstName)
    .replace(/{{phone}}/gi, phone)
    .replace(/{{batch}}/gi, batch);
}

/**
 * Create a direct WhatsApp Click-to-Chat URL
 * Format: https://wa.me/234XXXXXXXXXX?text=...
 */
export function generateWhatsAppLink(e164Digits: string, text: string): string {
  if (!e164Digits) return '';
  const cleanDigits = e164Digits.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}
