/**
 * KINGSOK CSV Exporter
 * Generates clean, RFC-4180 compliant CSV exports for Standard use and Google Contacts Android Import.
 */

import { ContactRecord, BatchInfo } from './types';

/**
 * Escape a CSV field according to RFC-4180 rules
 */
export function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generate standard CSV file for a batch or list of contacts
 */
export function generateStandardContactsCsv(contacts: ContactRecord[]): string {
  const headers = [
    'Name',
    'Phone',
    'International Phone (E.164)',
    'Network',
    'Consent Status',
    'Batch',
    'Notes',
  ];

  const lines = [headers.map(escapeCsvField).join(',')];

  for (const c of contacts) {
    lines.push(
      [
        escapeCsvField(c.displayName),
        escapeCsvField(c.displayPhone || c.rawPhone),
        escapeCsvField(c.normalizedPhone),
        escapeCsvField(c.network),
        escapeCsvField(c.consentStatus),
        escapeCsvField(c.batchName || (c.batchNumber ? `Batch ${c.batchNumber}` : '')),
        escapeCsvField(c.notes || ''),
      ].join(',')
    );
  }

  return lines.join('\r\n');
}

/**
 * Generate Google Contacts / Android compatible CSV file.
 * This can be imported directly into Google Contacts (contacts.google.com),
 * and automatically assigns a contact label like "KINGSOK_Batch_01".
 */
export function generateGoogleContactsImportCsv(
  contacts: ContactRecord[],
  labelName?: string
): string {
  const groupLabel = labelName ? `* myContacts ::: ${labelName}` : '* myContacts';

  const headers = [
    'Name',
    'Given Name',
    'Family Name',
    'Phone 1 - Type',
    'Phone 1 - Value',
    'Group Membership',
  ];

  const lines = [headers.map(escapeCsvField).join(',')];

  for (const c of contacts) {
    lines.push(
      [
        escapeCsvField(c.displayName),
        escapeCsvField(c.firstName),
        escapeCsvField(c.lastName),
        escapeCsvField('Mobile'),
        escapeCsvField(c.normalizedPhone || c.rawPhone),
        escapeCsvField(groupLabel),
      ].join(',')
    );
  }

  return lines.join('\r\n');
}

/**
 * Export invalid or ambiguous records for review
 */
export function generateInvalidContactsCsv(contacts: ContactRecord[]): string {
  const headers = [
    'Name',
    'Raw Phone',
    'Issue / Reason',
    'Original Row',
  ];

  const lines = [headers.map(escapeCsvField).join(',')];

  for (const c of contacts) {
    if (!c.isValid) {
      lines.push(
        [
          escapeCsvField(c.rawName || c.displayName),
          escapeCsvField(c.rawPhone),
          escapeCsvField(c.validationReason),
          escapeCsvField(c.originalRowIndex),
        ].join(',')
      );
    }
  }

  return lines.join('\r\n');
}

/**
 * Export duplicate records for review
 */
export function generateDuplicatesCsv(contacts: ContactRecord[]): string {
  const headers = [
    'Name',
    'Normalized Phone',
    'Raw Phone',
    'Duplicate Of ID',
    'Original Row',
  ];

  const lines = [headers.map(escapeCsvField).join(',')];

  for (const c of contacts) {
    if (c.isDuplicate) {
      lines.push(
        [
          escapeCsvField(c.displayName),
          escapeCsvField(c.normalizedPhone),
          escapeCsvField(c.rawPhone),
          escapeCsvField(c.duplicateOfId || ''),
          escapeCsvField(c.originalRowIndex),
        ].join(',')
      );
    }
  }

  return lines.join('\r\n');
}

/**
 * Export Opted-Out Suppression List
 */
export function generateOptedOutCsv(contacts: ContactRecord[]): string {
  const headers = [
    'Name',
    'Normalized Phone',
    'Consent Status',
    'Suppression Notice',
  ];

  const lines = [headers.map(escapeCsvField).join(',')];

  for (const c of contacts) {
    if (c.consentStatus === 'opted_out') {
      lines.push(
        [
          escapeCsvField(c.displayName),
          escapeCsvField(c.normalizedPhone),
          escapeCsvField('opted_out'),
          escapeCsvField('DO NOT SEND PROMOTIONS (USER OPTED OUT)'),
        ].join(',')
      );
    }
  }

  return lines.join('\r\n');
}

/**
 * Trigger client-side file download in browser
 */
export function triggerCsvDownload(filename: string, content: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
