/**
 * UNN & Campus Prospect Identification & Cleaning Engine
 * 
 * Accurately detects UNN students, freshers, lodge prospects, and departmental contacts
 * based on saved naming conventions:
 * - Cohorts: 0'29, 029, 0'30, 030, etc.
 * - Roles & Status: NS (New Student), Fresher, CuSt (Customer Student), Rep, Valor, Tour 1.0
 * - Inquiries: PROP (Property), Lodge, Agency
 * - Departments & Faculties: Electrical, Electronic, MedSurg, Nursing, Pharmacy, Civil, Mech, etc.
 */

import { ContactRecord } from './types';

export const UNN_DETECTION_PATTERNS = [
  // Cohorts & Tags
  { tag: "0'29 Cohort", pattern: /\b0'?2[789]\b/i },
  { tag: "0'30 Cohort", pattern: /\b0'?3[012]\b/i },
  { tag: "New Student (NS)", pattern: /\b(ns|nns)\b/i },
  { tag: "New Student", pattern: /\bnew\s*students?\b/i },
  { tag: "Fresher", pattern: /\bfreshers?\b/i },
  { tag: "Student Customer (CuSt)", pattern: /\bcust\b/i },
  { tag: "Property Lead (PROP)", pattern: /\bprop\b/i },
  { tag: "Lodge Inquiry", pattern: /\blodge\b/i },
  { tag: "Campus Tour Lead", pattern: /\btour(\s*1?\.?0?)?\b/i },
  { tag: "Valor Lodge", pattern: /\bvalor\b/i },
  { tag: "Student Rep", pattern: /\brep\b/i },
  { tag: "Agency", pattern: /\bagen[cg]y\b/i },
  { tag: "UNN Student", pattern: /\bunn\b/i },
  { tag: "UNEC Student", pattern: /\bunec\b/i },
  { tag: "Campus Resident", pattern: /\b(campus|hall|hostel|hilltop|ofulonu|odim|behind\s*flat|green\s*house)\b/i },

  // Engineering & Physical Sciences
  { tag: "Electrical Eng", pattern: /\b(electrical|elect)\b/i },
  { tag: "Electronic Eng", pattern: /\belectronic\b/i },
  { tag: "Mechanical Eng", pattern: /\b(mechanical|mech)\b/i },
  { tag: "Civil Eng", pattern: /\bcivil\b/i },
  { tag: "Metallurgy Eng", pattern: /\b(metallurgy|metullurgy)\b/i },
  { tag: "Computer Science", pattern: /\b(comp(uter)?\s*sci|software|cyber)\b/i },
  { tag: "Geology", pattern: /\bgeology\b/i },
  { tag: "Physics", pattern: /\bphysics\b/i },
  { tag: "Chemistry", pattern: /\bchemistry\b/i },
  { tag: "Mathematics", pattern: /\bmaths?\b/i },
  { tag: "Statistics", pattern: /\bstatistics\b/i },
  { tag: "Architecture", pattern: /\barchitecture\b/i },
  { tag: "Estate Mgmt", pattern: /\b(estate|surveying|urban)\b/i },

  // Medical, Health & Biological Sciences
  { tag: "MedSurg / Surgery", pattern: /\b(medsurg|med\s*surg|surgery)\b/i },
  { tag: "Medicine", pattern: /\b(medicine|med)\b/i },
  { tag: "Nursing", pattern: /\b(nursing|nurs)\b/i },
  { tag: "Pharmacy", pattern: /\b(pharmacy|pharm)\b/i },
  { tag: "Medical Lab (MLS)", pattern: /\b(med(ical)?\s*lab|mls)\b/i },
  { tag: "Sci Lab Tech (SLT)", pattern: /\bslt\b/i },
  { tag: "Anatomy", pattern: /\banatomy\b/i },
  { tag: "Physiology", pattern: /\bphysiology\b/i },
  { tag: "Dentistry", pattern: /\bdentistry\b/i },
  { tag: "Radiography", pattern: /\bradiography\b/i },
  { tag: "Biochemistry", pattern: /\bbiochem\b/i },
  { tag: "Microbiology (MCB)", pattern: /\b(microbio(logy)?|mcb)\b/i },
  { tag: "Bio Sciences (CBS)", pattern: /\bcbs\b/i },
  { tag: "Zoology / Botany", pattern: /\b(zoology|botany)\b/i },

  // Law, Social Sciences & Arts
  { tag: "Law", pattern: /\blaw\b/i },
  { tag: "Economics", pattern: /\b(economics|econ)\b/i },
  { tag: "Political Science", pattern: /\b(pol(itical)?(\s*sci)?)\b/i },
  { tag: "Mass Communication", pattern: /\bmass\s*comm\b/i },
  { tag: "Public Admin", pattern: /\b(pub(lic)?\s*admin)\b/i },
  { tag: "Sociology / Psych", pattern: /\b(sociology|psychology|philosophy)\b/i },
  { tag: "Accountancy", pattern: /\b(account(ancy|ing)?|acct)\b/i },
  { tag: "Banking & Finance", pattern: /\b(banking|finance)\b/i },
  { tag: "Marketing / Business", pattern: /\b(marketing|management|business)\b/i },
  { tag: "Agriculture", pattern: /\b(agriculture|agric|agronomy)\b/i },
  { tag: "Languages & Arts", pattern: /\b(theatre|music|linguistics|igbo|french|english|history)\b/i },
  { tag: "Education", pattern: /\b(education|edu)\b/i },
];

const NOISE_TOKENS = new Set([
  'prop', 'cust', 'lodge', 'rep', 'valor', 'agency', 'agent', 'tour', 'tour1.0',
  '029', "0'29", '030', "0'30", '028', "0'28", 'fresher', 'freshers', 'ns', 'new', 'student', 'students',
  'nns', 'unn', 'unec', 'work', 'book', 'dos', 'dog', 'claude', 'cbs', 'mcb',
  // Department & Faculty Words
  'electrical', 'electronic', 'elect', 'civil', 'mech', 'mechanical', 'metallurgy', 'metullurgy',
  'agric', 'agriculture', 'agronomy', 'medsurg', 'med', 'surg', 'medicine', 'surgery',
  'nursing', 'nurs', 'pharmacy', 'pharm', 'anatomy', 'physiology', 'dentistry',
  'mls', 'slt', 'radiography', 'rehab', 'law', 'computer', 'science', 'sci', 'software',
  'geology', 'physics', 'chemistry', 'math', 'maths', 'zoology', 'botany', 'biochem',
  'microbio', 'statistics', 'economics', 'econ', 'political', 'pol', 'mass', 'comm',
  'public', 'administration', 'admin', 'pub', 'sociology', 'psychology', 'philosophy',
  'acct', 'accounting', 'accountancy', 'banking', 'finance', 'marketing', 'management',
  'theatre', 'music', 'linguistics', 'igbo', 'french', 'english', 'history', 'architecture',
  'estate', 'surveying', 'urban', 'education', 'edu', 'foreign', 'lang',
  'human', 'engineering', 'eng', 'lab', 'tourism', 'hostel', 'campus'
]);

/**
 * Checks if a contact name indicates they are a UNN student, campus resident, or lodge prospect
 */
export function detectUnnContact(name: string): { isUnn: boolean; tags: string[]; cleanFirstName: string } {
  if (!name) return { isUnn: false, tags: [], cleanFirstName: 'there' };

  const matchedTags: string[] = [];
  for (const { tag, pattern } of UNN_DETECTION_PATTERNS) {
    if (pattern.test(name)) {
      matchedTags.push(tag);
    }
  }

  const cleanFirst = extractCleanStudentFirstName(name);
  return {
    isUnn: matchedTags.length > 0,
    tags: [...new Set(matchedTags)],
    cleanFirstName: cleanFirst,
  };
}

/**
 * Extracts a pristine, human first name by filtering out emojis, symbols,
 * departments, cohorts, and business tags.
 */
export function extractCleanStudentFirstName(rawName: string): string {
  if (!rawName) return 'there';

  // 1. Remove emojis and symbols
  const stripped = rawName
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[•~✨🤍£♠️😘🥰💖+_\-*#@!?()\[\]{}:;\\\/|<>="`]/g, ' ')
    .trim();

  // 2. Tokenize words
  const words = stripped.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'there';

  // 3. Find first token that is an actual human name (not in noiseTokens, length >= 2)
  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length >= 2 && !NOISE_TOKENS.has(cleanWord)) {
      // Capitalize properly
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    }
  }

  // Fallback to first alphanumeric token if all were filtered
  const fallback = words[0]?.replace(/[^a-zA-Z]/g, '');
  if (fallback && fallback.length >= 2) {
    return fallback.charAt(0).toUpperCase() + fallback.slice(1).toLowerCase();
  }

  return 'there';
}
