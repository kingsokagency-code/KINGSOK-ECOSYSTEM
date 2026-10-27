/**
 * KINGSOK High-Performance RFC-4180 Compliant CSV Parser
 * Built specifically for Android / Google Contacts exports, Excel exports, and raw contact lists.
 */

import { ColumnMapping, RawCsvPreview } from './types';

/**
 * Low-level RFC-4180 compliant CSV parser.
 * Handles embedded commas, escaped quotes (""), multi-line fields, and varied line breaks (CRLF, LF, CR).
 */
export function parseCsvRaw(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Strip optional UTF-8 BOM marker if present
  let text = csvText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const length = text.length;

  for (let i = 0; i < length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double-quote inside quotes
          currentField += '"';
          i++; // Skip the second quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // Skip the \n
        }
        currentRow.push(currentField);
        // Only push if row has content or isn't a trailing empty line
        if (currentRow.some((f) => f.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        if (currentRow.some((f) => f.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push any remaining field / row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Intelligent heuristic column detector for Android, Google, and standard CSVs
 */
export function detectColumns(headers: string[]): {
  detectedNameCol: string;
  detectedPhoneCol: string;
  detectedConsentCol?: string;
  detectedNotesCol?: string;
} {
  const normalized = headers.map((h) => h.trim().toLowerCase());

  // Priority search for Phone column
  let detectedPhoneCol = '';
  const phonePatterns = [
    'phone 1 - value',
    'phone 1',
    'mobile phone',
    'mobile number',
    'phone number',
    'cell phone',
    'whatsapp number',
    'whatsapp',
    'mobile',
    'phone',
    'telephone',
    'tel',
    'contact number',
    'msisdn',
  ];

  for (const pattern of phonePatterns) {
    const idx = normalized.findIndex((h) => h === pattern);
    if (idx !== -1) {
      detectedPhoneCol = headers[idx];
      break;
    }
  }

  // If no exact match, try includes
  if (!detectedPhoneCol) {
    const idx = normalized.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('cell') || h.includes('whatsapp'));
    if (idx !== -1) {
      detectedPhoneCol = headers[idx];
    }
  }

  // Priority search for Name column
  let detectedNameCol = '';
  const namePatterns = [
    'name',
    'full name',
    'display name',
    'contact name',
    'given name',
    'first name',
    'customer name',
    'student name',
    'subscriber name',
  ];

  for (const pattern of namePatterns) {
    const idx = normalized.findIndex((h) => h === pattern);
    if (idx !== -1) {
      detectedNameCol = headers[idx];
      break;
    }
  }

  // If no exact match, try includes
  if (!detectedNameCol) {
    const idx = normalized.findIndex((h) => h.includes('name'));
    if (idx !== -1) {
      detectedNameCol = headers[idx];
    }
  }

  // Consent column detection
  let detectedConsentCol: string | undefined;
  const consentIdx = normalized.findIndex((h) =>
    h.includes('consent') || h.includes('opt') || h.includes('permission') || h.includes('status')
  );
  if (consentIdx !== -1) {
    detectedConsentCol = headers[consentIdx];
  }

  // Notes column detection
  let detectedNotesCol: string | undefined;
  const notesIdx = normalized.findIndex((h) =>
    h.includes('notes') || h.includes('comment') || h.includes('memo') || h.includes('remark')
  );
  if (notesIdx !== -1) {
    detectedNotesCol = headers[notesIdx];
  }

  // Fallbacks if nothing detected
  if (!detectedNameCol && headers.length > 0) detectedNameCol = headers[0];
  if (!detectedPhoneCol && headers.length > 1) detectedPhoneCol = headers[1];

  return {
    detectedNameCol,
    detectedPhoneCol,
    detectedConsentCol,
    detectedNotesCol,
  };
}

/**
 * Generate a quick preview of the CSV file for user confirmation before parsing all 5,000+ rows
 */
export function generateCsvPreview(csvText: string, sampleLimit = 5): RawCsvPreview {
  const rows = parseCsvRaw(csvText);

  if (rows.length === 0) {
    return {
      headers: [],
      sampleRows: [],
      totalRows: 0,
      detectedNameCol: '',
      detectedPhoneCol: '',
    };
  }

  const headers = rows[0].map((h) => h.trim());
  const detected = detectColumns(headers);

  const sampleRows: Record<string, string>[] = [];
  const max = Math.min(rows.length, sampleLimit + 1);

  for (let r = 1; r < max; r++) {
    const row = rows[r];
    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = row[colIdx]?.trim() ?? '';
    });
    sampleRows.push(rowObj);
  }

  return {
    headers,
    sampleRows,
    totalRows: Math.max(0, rows.length - 1),
    detectedNameCol: detected.detectedNameCol,
    detectedPhoneCol: detected.detectedPhoneCol,
    detectedConsentCol: detected.detectedConsentCol,
  };
}

/**
 * Extract structured rows from raw CSV given column mappings
 */
export function parseCsvWithMapping(
  csvText: string,
  mapping: ColumnMapping
): { rawName: string; rawPhone: string; rawConsent?: string; rawNotes?: string; rowIndex: number }[] {
  const rows = parseCsvRaw(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const nameIdx = headers.indexOf(mapping.nameColumn);
  const phoneIdx = headers.indexOf(mapping.phoneColumn);
  const consentIdx = mapping.consentColumn ? headers.indexOf(mapping.consentColumn) : -1;
  const notesIdx = mapping.notesColumn ? headers.indexOf(mapping.notesColumn) : -1;

  // Check for Google Contacts specific columns for richer extraction
  const firstNameIdx = headers.indexOf('First Name');
  const middleNameIdx = headers.indexOf('Middle Name');
  const lastNameIdx = headers.indexOf('Last Name');
  const fileAsIdx = headers.indexOf('File As');
  const orgNameIdx = headers.indexOf('Organization Name');
  const nicknameIdx = headers.indexOf('Nickname');
  const phone2Idx = headers.indexOf('Phone 2 - Value');

  const isGoogleContacts = firstNameIdx !== -1 && (lastNameIdx !== -1 || phone2Idx !== -1);

  const results: { rawName: string; rawPhone: string; rawConsent?: string; rawNotes?: string; rowIndex: number }[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    let rawName = '';
    if (isGoogleContacts) {
      const fn = row[firstNameIdx]?.trim() || '';
      const mn = middleNameIdx !== -1 ? row[middleNameIdx]?.trim() || '' : '';
      const ln = lastNameIdx !== -1 ? row[lastNameIdx]?.trim() || '' : '';
      const fileAs = fileAsIdx !== -1 ? row[fileAsIdx]?.trim() || '' : '';
      const orgName = orgNameIdx !== -1 ? row[orgNameIdx]?.trim() || '' : '';
      const nick = nicknameIdx !== -1 ? row[nicknameIdx]?.trim() || '' : '';

      const fullParts = [fn, mn, ln].filter(Boolean);
      let combined = fullParts.length > 0 ? fullParts.join(' ') : fileAs || orgName || nick || '';

      // Clean leading/trailing punctuation-only names like "," or "."
      if (/^[.,_\-~*#]+$/.test(combined.trim())) {
        combined = orgName || fileAs || nick || '';
      }

      rawName = combined.trim() || (nameIdx !== -1 ? row[nameIdx]?.trim() || '' : '');
    } else {
      rawName = nameIdx !== -1 ? row[nameIdx]?.trim() || '' : '';
    }

    // Phone extraction with secondary phone fallback
    let rawPhone = phoneIdx !== -1 ? row[phoneIdx]?.trim() || '' : '';
    if (!rawPhone && phone2Idx !== -1) {
      rawPhone = row[phone2Idx]?.trim() || '';
    }

    const rawConsent = consentIdx !== -1 ? row[consentIdx]?.trim() || undefined : undefined;
    const rawNotes = notesIdx !== -1 ? row[notesIdx]?.trim() || undefined : undefined;

    results.push({
      rawName: rawName.trim(),
      rawPhone: rawPhone.trim(),
      rawConsent: rawConsent?.trim(),
      rawNotes: rawNotes?.trim(),
      rowIndex: r,
    });
  }

  return results;
}
