/**
 * KINGSOK Contact Organizer & Messaging Assistant
 * Core Data Types and Interfaces
 */

export type ConsentStatus = 'unknown' | 'opted_in' | 'opted_out';

export type NetworkProvider = 'MTN' | 'Airtel' | 'Glo' | '9mobile' | 'International' | 'Unknown';

export interface PhoneNormalizationResult {
  raw: string;
  normalized: string;       // E.164 formatted: +2348031234567
  e164Digits: string;       // Pure digits for wa.me: 2348031234567
  display: string;          // Formatted: +234 803 123 4567
  localDisplay: string;     // Formatted: 0803 123 4567
  isValid: boolean;
  network: NetworkProvider;
  reason: string;
}

export interface ContactRecord {
  id: string;
  rawName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  rawPhone: string;
  normalizedPhone: string;
  e164Digits: string;
  displayPhone: string;
  network: NetworkProvider;
  isValid: boolean;
  validationReason: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
  consentStatus: ConsentStatus;
  isUnnVerified?: boolean;
  unnTags?: string[];
  batchNumber?: number;
  batchName?: string;
  notes?: string;
  originalRowIndex: number;
}

export interface BatchInfo {
  batchNumber: number;
  batchName: string;
  count: number;
  startIndex: number;
  endIndex: number;
  contacts: ContactRecord[];
}

export interface CleaningReport {
  totalImported: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  uniqueValidCount: number;
  optedInCount: number;
  unknownConsentCount: number;
  optedOutCount: number;
  unnVerifiedCount?: number;
  totalBatches: number;
  batchSize: number;
  processingTimeMs: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'accommodation' | 'admission' | 'consent' | 'general';
  description: string;
  content: string;
  createdAt: string;
  isSystem?: boolean;
}

export interface ColumnMapping {
  nameColumn: string;
  phoneColumn: string;
  consentColumn?: string;
  notesColumn?: string;
}

export interface RawCsvPreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  detectedNameCol: string;
  detectedPhoneCol: string;
  detectedConsentCol?: string;
}
