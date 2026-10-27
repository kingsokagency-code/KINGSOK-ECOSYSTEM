/**
 * KINGSOK Phone Number Normalization & Validation Engine
 * Specializing in Nigerian (+234) Mobile Networks and International E.164 Standards
 */

import { NetworkProvider, PhoneNormalizationResult } from './types';

// Known Nigerian Network Mobile Prefix Maps (4-digit local prefix)
const MTN_PREFIXES = new Set([
  '0803', '0806', '0813', '0816', '0810', '0814',
  '0903', '0906', '0913', '0916',
  '0703', '0706', '0704', '07025', '07026',
]);

const AIRTEL_PREFIXES = new Set([
  '0802', '0808', '0812',
  '0701', '0708',
  '0901', '0902', '0904', '0907', '0912',
]);

const GLO_PREFIXES = new Set([
  '0805', '0807', '0811', '0815',
  '0705',
  '0905', '0915',
]);

const NINEMOBILE_PREFIXES = new Set([
  '0809', '0817', '0818',
  '0908', '0909',
]);

/**
 * Identify telecom carrier based on Nigerian 4-digit or 5-digit local prefix
 */
export function identifyCarrier(local11Digit: string): NetworkProvider {
  if (local11Digit.length < 4) return 'Unknown';
  
  const prefix5 = local11Digit.slice(0, 5);
  if (MTN_PREFIXES.has(prefix5)) return 'MTN';

  const prefix4 = local11Digit.slice(0, 4);
  if (MTN_PREFIXES.has(prefix4)) return 'MTN';
  if (AIRTEL_PREFIXES.has(prefix4)) return 'Airtel';
  if (GLO_PREFIXES.has(prefix4)) return 'Glo';
  if (NINEMOBILE_PREFIXES.has(prefix4)) return '9mobile';

  return 'Unknown';
}

/**
 * Handle Excel scientific notation corruption like "2.34803E+12" or "2.348031234567e+12"
 */
function handleScientificNotation(raw: string): string {
  const trimmed = raw.trim();
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(trimmed)) {
    try {
      const num = Number(trimmed);
      if (!isNaN(num) && isFinite(num)) {
        // Convert to fixed string
        return BigInt(Math.round(num)).toString();
      }
    } catch {
      // Ignore conversion failure and proceed to normal processing
    }
  }
  return raw;
}

/**
 * Normalize and validate any phone number, prioritizing Nigerian numbers.
 * Never guesses ambiguous or incomplete numbers.
 */
export function normalizePhoneNumber(rawInput: string | null | undefined): PhoneNormalizationResult {
  const raw = (rawInput ?? '').toString().trim();

  if (!raw) {
    return {
      raw: '',
      normalized: '',
      e164Digits: '',
      display: '',
      localDisplay: '',
      isValid: false,
      network: 'Unknown',
      reason: 'Empty phone number field',
    };
  }

  // 1. Recover from Excel scientific notation if present
  let sanitized = handleScientificNotation(raw);

  // 2. Handle multiple numbers in a single record (e.g. "08031234567 / 08055555555" or "08031234567 ::: +234 803...")
  // Split on delimiters and take the first prominent number
  if (/[\/;,]|:::/.test(sanitized)) {
    const parts = sanitized.split(/[\/;,]|:::/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      sanitized = parts[0];
    }
  }

  // 3. Remove metadata like "::: Mobile" or "(Work)" or "TEL:"
  sanitized = sanitized
    .replace(/(:::|\b(mobile|work|home|cell|main|other)\b)/gi, '')
    .trim();

  // 4. Handle "+234 (0) 803 123 4567" pattern and "+23408031234567" redundant zero pattern
  sanitized = sanitized.replace(/\+?234[\s.-]*\(0\)/gi, '+234');
  sanitized = sanitized.replace(/^(\+?234)[\s.-]*0([789]\d{8,9})$/i, '$1$2');

  // Check if string contains alphabetic characters (after stripping allowed text)
  if (/[a-zA-Z]/.test(sanitized)) {
    return {
      raw,
      normalized: '',
      e164Digits: '',
      display: raw,
      localDisplay: raw,
      isValid: false,
      network: 'Unknown',
      reason: 'Contains non-numeric text characters',
    };
  }

  const hasLeadingPlus = sanitized.startsWith('+');
  const digitsOnly = sanitized.replace(/\D/g, '');

  if (!digitsOnly) {
    return {
      raw,
      normalized: '',
      e164Digits: '',
      display: raw,
      localDisplay: raw,
      isValid: false,
      network: 'Unknown',
      reason: 'No numeric digits found',
    };
  }

  // -------------------------------------------------------------
  // Scenario A: Nigerian Number Formats
  // Standard Nigerian numbers have 10 digits after the 234 country code.
  // -------------------------------------------------------------

  // Case A1: 11 digits starting with 0 (e.g. "08031234567", "07012345678", "09012345678", "09112345678")
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const secondDigit = digitsOnly[1];
    // Valid Nigerian mobile second digits are 7, 8, 9 (and landlines 1, 2)
    if (['7', '8', '9'].includes(secondDigit)) {
      const carrier = identifyCarrier(digitsOnly);
      const e164Digits = '234' + digitsOnly.slice(1);
      const normalized = '+' + e164Digits;
      const display = `+234 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
      const localDisplay = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;

      return {
        raw,
        normalized,
        e164Digits,
        display,
        localDisplay,
        isValid: true,
        network: carrier,
        reason: carrier !== 'Unknown' 
          ? `Valid Nigerian mobile (${carrier})` 
          : 'Valid Nigerian mobile format',
      };
    } else {
      return {
        raw,
        normalized: '',
        e164Digits: '',
        display: raw,
        localDisplay: raw,
        isValid: false,
        network: 'Unknown',
        reason: `Ambiguous Nigerian prefix "0${secondDigit}" (mobile networks start with 07, 08, 09)`,
      };
    }
  }

  // Case A2: 13 digits starting with 234 (e.g. "2348031234567" or "+2348031234567")
  if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
    const local11 = '0' + digitsOnly.slice(3);
    const subDigit = local11[1];
    if (['7', '8', '9'].includes(subDigit)) {
      const carrier = identifyCarrier(local11);
      const e164Digits = digitsOnly;
      const normalized = '+' + e164Digits;
      const display = `+234 ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6, 9)} ${digitsOnly.slice(9)}`;
      const localDisplay = `${local11.slice(0, 4)} ${local11.slice(4, 7)} ${local11.slice(7)}`;

      return {
        raw,
        normalized,
        e164Digits,
        display,
        localDisplay,
        isValid: true,
        network: carrier,
        reason: carrier !== 'Unknown' 
          ? `Valid Nigerian mobile (${carrier})` 
          : 'Valid Nigerian mobile format',
      };
    } else {
      return {
        raw,
        normalized: '',
        e164Digits: '',
        display: raw,
        localDisplay: raw,
        isValid: false,
        network: 'Unknown',
        reason: `Ambiguous Nigerian national prefix "234${digitsOnly[3]}"`,
      };
    }
  }

  // Case A3: 10 digits missing leading 0 (e.g. "8031234567", "7012345678", "9012345678", "9112345678")
  if (digitsOnly.length === 10 && ['7', '8', '9'].includes(digitsOnly[0])) {
    const local11 = '0' + digitsOnly;
    const carrier = identifyCarrier(local11);
    const e164Digits = '234' + digitsOnly;
    const normalized = '+' + e164Digits;
    const display = `+234 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
    const localDisplay = `${local11.slice(0, 4)} ${local11.slice(4, 7)} ${local11.slice(7)}`;

    return {
      raw,
      normalized,
      e164Digits,
      display,
      localDisplay,
      isValid: true,
      network: carrier,
      reason: `Valid Nigerian mobile (leading 0 restored, ${carrier})`,
    };
  }

  // Case A4: Starts with 234 or +234, but has wrong number of digits (e.g., incomplete 10, 11, 12 digits or >13 digits)
  if (digitsOnly.startsWith('234') && digitsOnly.length !== 13) {
    return {
      raw,
      normalized: '',
      e164Digits: '',
      display: raw,
      localDisplay: raw,
      isValid: false,
      network: 'Unknown',
      reason: digitsOnly.length < 13 
        ? `Incomplete Nigerian number: only ${digitsOnly.length} digits found (expected 13 with 234 prefix)` 
        : `Too many digits for Nigerian number (${digitsOnly.length} digits)`,
    };
  }

  // Case A5: Starts with 0, but has wrong length (e.g. 8, 9, 10, or 12 digits)
  if (digitsOnly.startsWith('0') && digitsOnly.length !== 11) {
    return {
      raw,
      normalized: '',
      e164Digits: '',
      display: raw,
      localDisplay: raw,
      isValid: false,
      network: 'Unknown',
      reason: digitsOnly.length < 11 
        ? `Incomplete number: only ${digitsOnly.length} digits (expected 11 with leading 0)` 
        : `Number exceeds standard 11 digits (${digitsOnly.length} digits)`,
    };
  }

  // -------------------------------------------------------------
  // Scenario B: International Numbers (Non-Nigerian E.164)
  // Standard E.164 numbers have 7 to 15 digits and start with +
  // -------------------------------------------------------------
  if (hasLeadingPlus || digitsOnly.length >= 11) {
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      const normalized = '+' + digitsOnly;
      return {
        raw,
        normalized,
        e164Digits: digitsOnly,
        display: normalized,
        localDisplay: normalized,
        isValid: true,
        network: 'International',
        reason: 'Valid international number (E.164)',
      };
    }
  }

  // -------------------------------------------------------------
  // Scenario C: Invalid / Ambiguous
  // -------------------------------------------------------------
  if (digitsOnly.length < 7) {
    return {
      raw,
      normalized: '',
      e164Digits: '',
      display: raw,
      localDisplay: raw,
      isValid: false,
      network: 'Unknown',
      reason: `Too short: only ${digitsOnly.length} digits`,
    };
  }

  return {
    raw,
    normalized: '',
    e164Digits: '',
    display: raw,
    localDisplay: raw,
    isValid: false,
    network: 'Unknown',
    reason: `Ambiguous format (${digitsOnly.length} digits without country code)`,
  };
}
